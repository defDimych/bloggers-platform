import { OmitType } from '@nestjs/swagger';
import { UserDbModel } from '../../types/user-db-model.type';
import { User } from '../../entities/user.entity';

export class UsersViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapManyToView = (user: UserDbModel): UsersViewDto => {
    const dto = new UsersViewDto();

    dto.id = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  };

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

  static mapToView(user: UserDbModel) {
    const dto = new MeViewDto();

    dto.userId = user.id.toString();
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
