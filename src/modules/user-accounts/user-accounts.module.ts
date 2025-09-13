import { forwardRef, Module } from '@nestjs/common';
import { SuperAdminUsersController } from './api/super-admin-users.controller';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersFactory } from './application/factories/users.factory';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { UsersService } from './application/services/users.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailConfirmation } from './entities/email-confirmation.entity';
import { PasswordRecovery } from './entities/password-recovery.entity';

const useCases = [CreateUserUseCase, DeleteUserUseCase];

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, EmailConfirmation, PasswordRecovery]),
  ],
  controllers: [SuperAdminUsersController],
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
