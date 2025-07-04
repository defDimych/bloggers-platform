import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../setup/config-validation.utility';

@Injectable()
export class NotificationConfig {
  @IsNotEmpty({
    message: 'Set Env variable EMAIL_USERNAME, example: dmitriy@gmail.com',
  })
  emailUserName: string;

  @IsNotEmpty({
    message: 'Set Env variable EMAIL_PASSWORD, example: sana ppdn rhod fpmi',
  })
  emailPassword: string;

  constructor(private configService: ConfigService<any, true>) {
    this.emailUserName = this.configService.get('EMAIL_USERNAME');
    this.emailPassword = this.configService.get('EMAIL_PASSWORD');

    configValidationUtility.validateConfig(this);
  }
}
