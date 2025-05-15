import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../services/crypto.service';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

export class UsersFactory {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private bcryptService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    await this.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.createPasswordHash(dto.password);

    return this.createUserInstance(dto, passwordHash);
  }
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

  private async createPasswordHash(password: string): Promise<string> {
    return this.bcryptService.generateHash(password);
  }

  private createUserInstance(
    dto: CreateUserDto,
    passwordHash: string,
  ): UserDocument {
    return this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }
}
