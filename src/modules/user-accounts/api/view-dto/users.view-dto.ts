import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

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

export class MeViewDto extends OmitType(UsersViewDto, [
  'id',
  'createdAt',
] as const) {
  userId: string;

  static mapToView(user: UserDocument) {
    const dto = new MeViewDto();

    dto.userId = user._id.toString();
    dto.login = user.accountData.login;
    dto.email = user.accountData.email;

    return dto;
  }
}
