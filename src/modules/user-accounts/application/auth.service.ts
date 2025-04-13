import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.accountData.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user._id.toString() };
  }

  login(userId: string): { accessToken: string } {
    const accessToken = this.jwtService.sign({ sub: userId });

    return {
      accessToken,
    };
  }

  async emailConfirmation(dto: { code: string }): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(dto.code);

    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          {
            message:
              'Confirmation code is incorrect, expired or already been applied',
            key: 'code',
          },
        ],
      });
    }

    user.confirmEmail();

    await this.usersRepository.save(user);
  }
}
