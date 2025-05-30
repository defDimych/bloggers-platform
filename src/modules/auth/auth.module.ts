import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { AuthConfig } from './config/auth.config';
import { AuthService } from './application/services/auth.service';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CryptoService } from './application/services/crypto.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { EmailConfirmationUseCase } from './application/usecases/email-confirmation.usecase';
import { RegistrationEmailResendingUseCase } from './application/usecases/registration-email-resending.usecase';
import { PasswordRecoveryUseCase } from './application/usecases/password-recovery.usecase';
import { ConfirmPasswordRecoveryUseCase } from './application/usecases/confirm-password-recovery.usecase';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { NotificationModule } from '../notifications/notification.module';
import { AuthQueryRepository } from './infrastructure/auth.query-repository';

const useCases = [
  LoginUserUseCase,
  RegisterUserUseCase,
  EmailConfirmationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  ConfirmPasswordRecoveryUseCase,
];

@Global()
@Module({
  imports: [
    forwardRef(() => UserAccountsModule),
    JwtModule,
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    ...useCases,
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (authConfig: AuthConfig): JwtService => {
        return new JwtService({
          secret: authConfig.accessTokenSecret,
          signOptions: { expiresIn: authConfig.accessTokenExpireIn },
        });
      },
      inject: [AuthConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (authConfig: AuthConfig): JwtService => {
        return new JwtService({
          secret: authConfig.refreshTokenSecret,
          signOptions: { expiresIn: authConfig.refreshTokenExpireIn },
        });
      },
      inject: [AuthConfig],
    },
    JwtStrategy,
    AuthConfig,
    AuthService,
    CryptoService,
    LocalStrategy,
    BasicAuthGuard,
    AuthQueryRepository,
  ],
  exports: [JwtStrategy, JwtModule, AuthConfig, CryptoService, BasicAuthGuard],
})
export class AuthModule {}
