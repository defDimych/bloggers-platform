import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async makeDeleted(userId: number): Promise<void> {
    await this.usersRepo.softDelete({ id: userId });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { id },
      withDeleted: false,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      relations: {
        recovery: true,
        confirmation: true,
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

  async findUserByPasswordRecoveryCode(
    recoveryCode: string,
  ): Promise<User | null> {
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

  async findUserByEmailConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        confirmation: true,
      },
      where: {
        confirmation: {
          confirmationCode: confirmationCode,
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
