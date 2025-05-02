import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { CryptoService } from './application/crypto.service';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { AuthController } from './api/auth.controller';
import { LocalStrategy } from './guards/local/local.strategy';
import { AuthService } from './application/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notifications/notification.module';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { AuthConfig } from './config/auth.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [UserAccountsModule],
      inject: [AuthConfig],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.accessTokenSecret,
        signOptions: { expiresIn: authConfig.accessTokenExpireIn },
      }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
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
