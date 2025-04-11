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

@Module({
  imports: [
    JwtModule.register({
      secret: 'access-token-secret', // TODO: Move to env file
      signOptions: { expiresIn: '5m' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    CryptoService,
    UsersRepository,
    UsersQueryRepository,
    LocalStrategy,
    AuthService,
  ],
})
export class UserAccountsModule {}
