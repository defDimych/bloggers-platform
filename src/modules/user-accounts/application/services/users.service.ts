import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async checkUniqueOrThrow(login: string, email: string): Promise<void> {
    const result = await this.usersRepository.findExistingUserByLoginOrEmail(
      login,
      email,
    );

    if (result) {
      const conflictField = result.login === login ? 'login' : 'email';

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
