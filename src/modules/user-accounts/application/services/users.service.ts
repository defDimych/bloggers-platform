import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  async checkUniqueOrThrow(login: string, email: string): Promise<void> {
    const foundUserByLogin = await this.usersRepository.findByLogin(login);

    if (foundUserByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'User with the same login already exists', key: 'login' },
        ],
      });
    }

    const foundUserByEmail = await this.usersRepository.findByEmail(email);

    if (foundUserByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'User with the same email already exists', key: 'email' },
        ],
      });
    }
  }
}
