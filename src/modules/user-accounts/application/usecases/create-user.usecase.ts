import { CreateUserDto } from '../../dto/create-user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../factories/users.factory';
import { UsersRepository } from '../../infrastructure/users.repository';

export class CreateUserCommand extends Command<string> {
  constructor(public dto: CreateUserDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    private usersFactory: UsersFactory,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const user = await this.usersFactory.create(dto);

    user.confirmEmail(); // Подтверждаем почту при создании user супер-админом

    await this.usersRepository.save(user);

    return user._id.toString();
  }
}
