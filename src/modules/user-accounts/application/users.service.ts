import { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from './bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private bcryptService: BcryptService,
    private usersRepository: UsersRepository,
  ) {}
  private async checkUniqueOrThrow(
    login: string,
    email: string,
  ): Promise<void> {
    const foundUserByLogin = await this.usersRepository.findByLogin(login);

    if (foundUserByLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'User with the same login already exists', key: 'login' },
        ],
      });
    }

    const foundUserByEmail = await this.usersRepository.findByEmail(email);

    if (foundUserByEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'User with the same email already exists', key: 'email' },
        ],
      });
    }
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    await this.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    user.confirmEmail();

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
