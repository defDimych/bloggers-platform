import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class AuthConfig {
  @IsBoolean({
    message:
      'Set Env variable SKIP_PASSWORD_CHECK to enable/disable, dangerous for production! example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  skipPasswordCheck: boolean;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  accessTokenExpireIn: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN, examples: 1h, 5m, 2d',
  })
  refreshTokenExpireIn: string;

  constructor(private configService: ConfigService<any, true>) {
    this.skipPasswordCheck = configValidationUtility.convertToBoolean(
      this.configService.get('SKIP_PASSWORD_CHECK'),
    ) as boolean;

    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );

    configValidationUtility.validateConfig(this);
  }
}
