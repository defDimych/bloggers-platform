import { CreateUserDto } from '../../dto/create-user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../../../auth/application/services/crypto.service';
import { UsersService } from '../services/users.service';

export class CreateUserCommand extends Command<number> {
  constructor(public dto: CreateUserDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: CryptoService,
    private usersService: UsersService,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<number> {
    await this.usersService.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    // user.confirmEmail(); // Подтверждаем почту при создании user супер-админом

    return this.usersRepository.insertOne({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }
}
