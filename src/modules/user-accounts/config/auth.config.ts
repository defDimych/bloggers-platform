import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig {
  skipPasswordCheck: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.skipPasswordCheck =
      this.configService.get('SKIP_PASSWORD_CHECK') === 'true';
  }
}
