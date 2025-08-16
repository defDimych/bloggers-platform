import { CreateUserDto } from '../../dto/create-user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { add } from 'date-fns';
import { UsersFactory } from '../factories/users.factory';

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
    const userId = await this.usersFactory.create(dto);

    const emailConfirmationDetails = {
      userId,
      confirmationCode: crypto.randomUUID(),
      expirationDate: add(new Date(), {
        minutes: 5,
      }),
      isConfirmed: true, // при создании супер-админом true
    };

    await this.usersRepository.setEmailConfirmationDetails(
      emailConfirmationDetails,
    );

    return userId;
  }
}
