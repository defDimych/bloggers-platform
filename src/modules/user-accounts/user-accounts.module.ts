import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersFactory } from './application/factories/users.factory';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { UsersService } from './application/services/users.service';
import { AuthModule } from '../auth/auth.module';

const useCases = [CreateUserUseCase, DeleteUserUseCase];

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    ...useCases,
    UsersFactory,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
  exports: [UsersRepository, UsersFactory],
})
export class UserAccountsModule {}
