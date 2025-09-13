import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserDbModel } from '../types/user-db-model.type';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async makeDeleted(userId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Users" SET "deletedAt" = now() WHERE id = $1`,
      [userId],
    );
  }

  async findUserById(id: number): Promise<UserDbModel | null> {
    const result = await this.dataSource.query<UserDbModel[]>(
      `SELECT * FROM "Users" WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findEmailConfirmDetailsByUserIdOrThrow(
    userId: number,
  ): Promise<{ id: number; isConfirmed: boolean }> {
    const result = await this.dataSource.query<
      { id: number; isConfirmed: boolean }[]
    >(
      `SELECT id, "isConfirmed" FROM "EmailConfirmationDetails" WHERE "userId" = $1`,
      [userId],
    );

    if (!result.length) {
      throw new Error(
        `Email confirmation details by userId:${userId} not found!`,
      );
    }
    return result[0];
  }

  // TODO authRepository ???
  async findEmailConfirmDetailsByConfirmCode(confirmCode: string): Promise<{
    id: number;
    isConfirmed: boolean;
    expirationDate: string;
  } | null> {
    const result = await this.dataSource.query<
      {
        id: number;
        isConfirmed: boolean;
        expirationDate: string;
      }[]
    >(
      `SELECT id, "isConfirmed", "expirationDate" FROM "EmailConfirmationDetails" WHERE "confirmationCode" = $1`,
      [confirmCode],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findUserByEmail(email: string): Promise<{ id: number } | null> {
    const result = await this.dataSource.query<{ id: number }[]>(
      `SELECT id FROM "Users" WHERE email = $1`,
      [email],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      relations: {
        recovery: true,
      },
      where: { email },
      withDeleted: false,
    });
  }

  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<{ id: number; passwordHash: string } | null> {
    const result = await this.dataSource.query<
      { id: number; passwordHash: string }[]
    >(
      `SELECT id, "passwordHash" FROM "Users" WHERE (login = $1 OR email = $2) AND "deletedAt" IS NULL`,
      [loginOrEmail, loginOrEmail],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findByPasswordRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        recovery: true,
      },
      where: {
        recovery: {
          recoveryCode: recoveryCode,
        },
      },
    });
  }

  async save(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }

  async createUser(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }

  async updateEmailConfirmCodeAndExpiry(dto: {
    id: number;
    confirmCode: string;
    exp: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `UPDATE "EmailConfirmationDetails" SET "confirmationCode" = $1, "expirationDate" = $2 WHERE id = $3`,
      [dto.confirmCode, dto.exp, dto.id],
    );
  }

  async updateEmailConfirmed(id: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE "EmailConfirmationDetails" SET "isConfirmed" = true WHERE id = $1`,
      [id],
    );
  }

  async findUserByLoginOrEmail(dto: {
    login: string;
    email: string;
  }): Promise<User | null> {
    return this.usersRepo.findOne({
      where: [{ login: dto.login }, { email: dto.email }],
      withDeleted: false,
    });
  }
}
