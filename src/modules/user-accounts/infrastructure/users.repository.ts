import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}
  async findUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [{ 'accountData.login': login }, { 'accountData.email': email }],
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
