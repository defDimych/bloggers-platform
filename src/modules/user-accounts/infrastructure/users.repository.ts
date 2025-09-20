import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        recovery: true,
        confirmation: true,
      },
      where: { email, deletedAt: IsNull() },
    });
  }

  async findUserByPasswordRecoveryCode(
    recoveryCode: string,
  ): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        recovery: true,
      },
      where: {
        recovery: {
          recoveryCode: recoveryCode,
        },
      },
    });
  }

  async findUserByEmailConfirmationCode(
    confirmationCode: string,
  ): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        confirmation: true,
      },
      where: {
        confirmation: {
          confirmationCode: confirmationCode,
        },
      },
    });
  }

  async findUserByLoginOrEmail(
    arg: string | { login: string; email: string },
  ): Promise<User | null> {
    const login = typeof arg === 'string' ? arg : arg.login;
    const email = typeof arg === 'string' ? arg : arg.email;

    return this.usersRepo.findOne({
      where: [
        { login, deletedAt: IsNull() },
        { email, deletedAt: IsNull() },
      ],
    });
  }

  async save(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }
}
