import { CreateUserDto } from '../dto/create-user.dto';
import { CryptoService } from './crypto.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private bcryptService: CryptoService,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
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

  private async createUserInstance(dto: CreateUserDto): Promise<UserDocument> {
    await this.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    return this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const user = await this.createUserInstance(dto);

    user.confirmEmail(); // Подтверждаем почту при создании user супер-админом

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async registerUser(dto: CreateUserDto): Promise<void> {
    const user = await this.createUserInstance(dto);

    const confirmationCode = crypto.randomUUID();

    user.setConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.accountData.email, confirmationCode)
      .catch(console.error);
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
