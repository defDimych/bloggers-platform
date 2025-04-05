import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id: id, 'accountData.deletedAt': null });
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

  // async findUserByLoginOrEmail(
  //   login: string,
  //   email: string,
  // ): Promise<UserDocument | null> {
  //   return this.UserModel.findOne({
  //     'accountData.deletedAt': null,
  //     $or: [{ 'accountData.login': login }, { 'accountData.email': email }],
  //   });
  // }

  async save(user: UserDocument) {
    await user.save();
  }
}
