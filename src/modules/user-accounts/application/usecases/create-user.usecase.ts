import { CreateUserDto } from '../../dto/create-user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersFactory } from '../factories/users.factory';
import { User } from '../../entities/user.entity';

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
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<number> {
    const user: User = await this.usersFactory.create(dto);

    user.confirmation.confirmEmail();

    await this.usersRepository.createUser(user);

    return user.id;
  }
}
