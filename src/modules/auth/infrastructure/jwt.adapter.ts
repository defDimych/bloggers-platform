import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constants';

export interface PayloadRefreshToken {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAdapter {
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

  createRefreshToken(userId: string, deviceId: string) {
    return this.refreshTokenContext.sign({ userId, deviceId });
  }

  getPayloadFromRefreshToken(token: string): PayloadRefreshToken {
    return this.jwtService.decode<PayloadRefreshToken>(token);
  }

  async verifyRefreshToken(token: string): Promise<PayloadRefreshToken | null> {
    try {
      return this.refreshTokenContext.verifyAsync<PayloadRefreshToken>(token);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
