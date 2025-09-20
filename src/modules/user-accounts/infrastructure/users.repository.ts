import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async makeDeleted(userId: number): Promise<void> {
    await this.usersRepo.softDelete({ id: userId });
  }

  async findUserById(id: number): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { id },
      withDeleted: false,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      relations: {
        recovery: true,
        confirmation: true,
      },
      where: { email },
      withDeleted: false,
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

  async save(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }

  async createUser(user: User): Promise<void> {
    await this.usersRepo.save(user);
  }

  async findUserByLoginOrEmail(
    arg: string | { login: string; email: string },
  ): Promise<User | null> {
    if (typeof arg === 'string') {
      return this.usersRepo.findOne({
        where: [{ login: arg }, { email: arg }],
        withDeleted: false,
      });
    }

    return this.usersRepo.findOne({
      where: [{ login: arg.login }, { email: arg.email }],
      withDeleted: false,
    });
  }
}
