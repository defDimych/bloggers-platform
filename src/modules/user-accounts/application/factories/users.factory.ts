import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../../../auth/application/services/crypto.service';
import { UsersService } from '../services/users.service';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class UsersFactory {
  constructor(
    private usersService: UsersService,
    private bcryptService: CryptoService,
    private usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<number> {
    await this.usersService.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.createPasswordHash(dto.password);

    return this.createUser(dto, passwordHash);
  }

  private async createPasswordHash(password: string): Promise<string> {
    return this.bcryptService.generateHash(password);
  }

  private createUser(
    dto: CreateUserDto,
    passwordHash: string,
  ): Promise<number> {
    return this.usersRepository.createUser({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }
}
