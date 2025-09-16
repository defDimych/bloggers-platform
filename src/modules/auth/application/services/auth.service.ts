import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { PayloadRefreshToken } from '../../infrastructure/jwt.adapter';
import { SessionDbModel } from '../../infrastructure/types/session-db-model.type';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private sessionsRepository: SessionsRepository,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { userId: user.id.toString() };
  }

  async sessionExists(
    dto: PayloadRefreshToken,
  ): Promise<SessionDbModel | null> {
    return this.sessionsRepository.findSession({
      iat: new Date(dto.iat * 1000),
      deviceId: dto.deviceId,
      userId: Number(dto.userId),
    });
  }
}
