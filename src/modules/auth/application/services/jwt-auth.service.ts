import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';

interface PayloadRefreshToken {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,

    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  createAccessToken(userId: string) {
    return this.accessTokenContext.sign({ userId });
  }

  createRefreshToken(userId: string) {
    return this.refreshTokenContext.sign({
      userId,
      deviceId: crypto.randomUUID(),
    });
  }

  getPayloadFromRefreshToken(token: string): PayloadRefreshToken {
    return this.jwtService.decode<PayloadRefreshToken>(token);
  }
}
