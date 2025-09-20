import { OmitType } from '@nestjs/swagger';
import { User } from '../../entities/user.entity';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView = (user: User): UsersViewDto => {
    const dto = new UsersViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt.toISOString();

    return dto;
  };
}

export class MeViewDto extends OmitType(UsersViewDto, [
  'id',
  'createdAt',
] as const) {
  userId: string;

  static mapToView(user: User) {
    const dto = new MeViewDto();

    dto.userId = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
