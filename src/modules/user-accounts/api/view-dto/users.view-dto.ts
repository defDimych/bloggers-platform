import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';
import { UserDbType } from '../../types/user-db.type';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapManyToView = (user: UserDocument): UsersViewDto => {
    const dto = new UsersViewDto();

    dto.id = user._id.toString();
    dto.login = user.accountData.login;
    dto.email = user.accountData.email;
    dto.createdAt = user.accountData.createdAt.toISOString();

    return dto;
  };

  static mapToView = (user: UserDbType): UsersViewDto => {
    const dto = new UsersViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

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
