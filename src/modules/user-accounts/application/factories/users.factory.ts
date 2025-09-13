import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../../../auth/application/services/crypto.service';
import { UsersService } from '../services/users.service';
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersFactory {
  constructor(
    private usersService: UsersService,
    private bcryptService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.usersService.checkUniqueOrThrow({
      login: dto.login,
      email: dto.email,
    });

    const passwordHash = await this.createPasswordHash(dto.password);

    return this.createUser(dto, passwordHash);
  }

  private async createPasswordHash(password: string): Promise<string> {
    return this.bcryptService.generateHash(password);
  }

  private createUser(dto: CreateUserDto, passwordHash: string): User {
    return User.create({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }
}
