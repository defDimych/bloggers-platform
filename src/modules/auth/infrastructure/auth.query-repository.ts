import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../user-accounts/infrastructure/users.repository';
import { MeViewDto } from '../../user-accounts/api/view-dto/users.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepository) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    return MeViewDto.mapToView(user);
  }
}
