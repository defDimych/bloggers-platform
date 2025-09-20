import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { Session } from '../../entities/session.entity';

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

  async getSessionByDeviceAndVersion(dto: {
    deviceId: string;
    iat: number;
  }): Promise<Session | null> {
    return this.sessionsRepository.findSessionByDeviceIdAndVersion({
      iat: new Date(dto.iat * 1000),
      deviceId: dto.deviceId,
    });
  }
}
