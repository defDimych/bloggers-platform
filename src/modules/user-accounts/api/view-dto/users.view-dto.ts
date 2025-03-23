import { UserDocument } from '../../domain/user.entity';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView = (user: UserDocument): UsersViewDto => {
    const dto = new UsersViewDto();

    dto.id = user._id.toString();
    dto.login = user.accountData.login;
    dto.email = user.accountData.email;
    dto.createdAt = user.accountData.createdAt.toISOString();

    return dto;
  };
}
