import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

@Injectable()
export class CoreConfig {
  THROTTLE_TTL: number = 10000;
  THROTTLE_LIMIT: number = 5;

  @IsNumber({}, { message: 'Set valid Env variable PORT, example: 3000' })
  @Min(1, { message: 'Set Env variable PORT, example: 3000' })
  port: number;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/blogs-and-posts-nest',
  })
  mongoURI: string;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  includeTestingModule: boolean;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS to enable/disable Dangerous for production internal server error details (message, etc), example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  sendInternalServerErrorDetails: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.mongoURI = this.configService.get('MONGO_URI');

    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;

    this.sendInternalServerErrorDetails =
      configValidationUtility.convertToBoolean(
        this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
      ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}
