import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/services/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { CryptoService } from './application/services/crypto.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/services/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationModule } from '../notifications/notification.module';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { AuthConfig } from './config/auth.config';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { UsersFactory } from './application/factories/users.factory';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';

const useCases = [LoginUserUseCase, CreateUserUseCase];

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
  ],
  controllers: [UsersController, AuthController],
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
    UsersService,
    UsersFactory,
    CryptoService,
    UsersRepository,
    UsersQueryRepository,
    AuthQueryRepository,
    BasicAuthGuard,
    JwtStrategy,
    LocalStrategy,
    AuthService,
    AuthConfig,
  ],
  exports: [JwtModule, AuthConfig],
})
export class UserAccountsModule {}
