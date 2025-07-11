import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { AuthConfig } from '../../config/auth.config';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { PayloadRefreshToken } from '../../infrastructure/jwt.adapter';
import { SessionDocument } from '../../domain/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private authConfig: AuthConfig,
    private sessionsRepository: SessionsRepository,
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
    return { userId: user._id.toString() };
  }

  async sessionExists(
    dto: PayloadRefreshToken,
  ): Promise<SessionDocument | null> {
    return this.sessionsRepository.findSession({
      iat: new Date(dto.iat * 1000),
      deviceId: dto.deviceId,
      userId: dto.userId,
    });
  }
}
