import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id: id, 'accountData.deletedAt': null });
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.deletedAt': null,
      'accountData.email': email,
    });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.deletedAt': null,
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.deletedAt': null,
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findByPasswordRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.deletedAt': null,
      'passwordRecovery.recoveryCode': code,
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }

  async insertOne(dto: {
    login: string;
    email: string;
    passwordHash: string;
  }): Promise<number> {
    const result: { id: number }[] = await this.dataSource.query(
      `INSERT INTO "Users" (login, email, "passwordHash") VALUES ($1, $2, $3) RETURNING id`,
      [dto.login, dto.email, dto.passwordHash],
    );

    return result[0].id;
  }

  async findExistingUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ login: string; email: string } | null> {
    const result: { login: string; email: string }[] | [] =
      await this.dataSource.query(
        `SELECT login, email FROM "Users" WHERE (login = $1 OR email = $2) AND "deletedAt" IS NULL LIMIT 1`,
        [login, email],
      );

    return result.length === 1 ? result[0] : null;
  }
}
