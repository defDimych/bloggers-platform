import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersFactory } from '../../../user-accounts/application/factories/users.factory';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand, void>
{
  constructor(
    private usersFactory: UsersFactory,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const user = await this.usersFactory.create(dto);

    const confirmationCode = crypto.randomUUID();

    user.setConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.accountData.email, confirmationCode)
      .catch(console.error);
  }
}
