import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthConfig } from '../../config/auth.config';
import { Request } from 'express';
import { PayloadRefreshToken } from '../../infrastructure/jwt.adapter';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ExtendedUserContextDto } from '../dto/extended-user-context.dto';

interface CookieStringRequest extends Request {
  cookies: Record<string, string>;
}

function cookieExtractor(req: CookieStringRequest): string | null {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies['refreshToken'];
  }
  return token;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwtRefresh',
) {
  constructor(
    authConfig: AuthConfig,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: authConfig.refreshTokenSecret,
    });
  }

  async validate(
    payload: PayloadRefreshToken,
  ): Promise<ExtendedUserContextDto> {
    const session = await this.authService.getSessionByDeviceAndVersion({
      deviceId: payload.deviceId,
      iat: payload.iat,
    });

    if (!session) {
      throw new DomainException({
        message: 'validation failed',
        code: DomainExceptionCode.Unauthorized,
      });
    }

    return {
      userId: session.userId.toString(),
      deviceId: session.deviceId,
    };
  }
}
