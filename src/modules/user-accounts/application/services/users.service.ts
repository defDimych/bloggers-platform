import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async checkUniqueOrThrow(dto: {
    login: string;
    email: string;
  }): Promise<void> {
    const user = await this.usersRepository.findUserByLoginOrEmail({
      login: dto.login,
      email: dto.email,
    });

    if (user) {
      const conflictField = user.login === dto.login ? 'login' : 'email';

      throw new DomainException({
        message: 'Validation failed',
        code: DomainExceptionCode.BadRequest,
        extensions: [
          {
            message: `User with the same ${conflictField} already exists`,
            key: conflictField,
          },
        ],
      });
    }
  }
}
