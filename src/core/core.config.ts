import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNumber, Min } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set valid Env variable PORT, example: 3000' })
  @Min(1, { message: 'Set Env variable PORT, example: 3000' })
  port: number;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));

    configValidationUtility.validateConfig(this);
  }
}
