import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig {
  skipPasswordCheck: boolean;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpireIn: string;
  refreshTokenExpireIn: string;

  constructor(private configService: ConfigService<any, true>) {
    this.skipPasswordCheck =
      this.configService.get('SKIP_PASSWORD_CHECK') === 'true';

    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );
  }
}
