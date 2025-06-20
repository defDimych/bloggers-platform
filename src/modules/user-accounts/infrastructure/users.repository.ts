import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id: id, 'accountData.deletedAt': null });
  }

  async findUsersById(ids: string[]): Promise<UserDocument[]> {
    return this.UserModel.find({
      _id: { $in: ids },
      'accountData.deletedAt': null,
    });
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

  async findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      'accountData.deletedAt': null,
      'accountData.login': login,
    });
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
}
