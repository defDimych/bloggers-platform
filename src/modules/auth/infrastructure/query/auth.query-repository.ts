import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../../user-accounts/entities/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async getInfoAboutCurrentUserOrThrow(userId: number): Promise<MeViewDto> {
    const user = await this.usersRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      throw new DomainException({
        message: `user by id:${userId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return MeViewDto.mapToView(user);
  }
}
