import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

@Injectable()
export class CoreConfig {
  THROTTLE_TTL: number = 10000;
  THROTTLE_LIMIT: number = 5;

  @IsNotEmpty({ message: 'Set Env variable HOST, example: localhost' })
  postgresHost: string;

  @IsNumber(
    {},
    { message: 'Set valid Env variable POSTGRES_PORT, example: 5432' },
  )
  @Min(1, { message: 'Set Env variable POSTGRES_PORT, example: 5432' })
  postgresPort: number;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_DATABASE, example: Bloggers-platform',
  })
  postgresDatabase: string;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_USERNAME, example: backend',
  })
  postgresUserName: string;

  @IsNotEmpty({
    message: 'Set Env variable POSTGRES_PASSWORD, example: backend123',
  })
  postgresPassword: string;

  @IsBoolean({
    message:
      'Set Env variable DB_AUTOSYNC to enable/disable dangerous for most environments, example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  dbAutosync: boolean;

  @IsBoolean({
    message:
      'Set Env variable DB_LOGGING_LEVEL to enable/disable, example: true, available values: [true, false, 0, 1, enabled, disabled]',
  })
  dbLoggingLevel: boolean;

  @IsNumber({}, { message: 'Set valid Env variable PORT, example: 3000' })
  @Min(1, { message: 'Set Env variable PORT, example: 3000' })
  port: number;

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
    this.postgresHost = this.configService.get('POSTGRES_HOST');
    this.postgresPort = Number(this.configService.get('POSTGRES_PORT'));
    this.postgresDatabase = this.configService.get('POSTGRES_DATABASE');
    this.postgresUserName = this.configService.get('POSTGRES_USERNAME');
    this.postgresPassword = this.configService.get('POSTGRES_PASSWORD');
    this.port = Number(this.configService.get('PORT'));

    this.dbLoggingLevel = configValidationUtility.convertToBoolean(
      this.configService.get('DB_LOGGING_LEVEL'),
    ) as boolean;

    this.dbAutosync = configValidationUtility.convertToBoolean(
      this.configService.get('DB_AUTOSYNC'),
    ) as boolean;

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
