import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { AuthConfig } from '../../config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private authConfig: AuthConfig,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    // Проверка SKIP_PASSWORD_CHECK
    if (!this.authConfig.skipPasswordCheck) {
      const isPasswordValid = await this.cryptoService.comparePasswords({
        password,
        hash: user.accountData.passwordHash,
      });

      if (!isPasswordValid) {
        return null;
      }
    }
    return { id: user._id.toString() };
  }
}
