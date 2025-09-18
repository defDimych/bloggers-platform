import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { UsersFactory } from '../../../user-accounts/application/factories/users.factory';
import { User } from '../../../user-accounts/entities/user.entity';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private usersFactory: UsersFactory,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const user: User = await this.usersFactory.create(dto);

    const confirmationCode: string = crypto.randomUUID();

    user.confirmation.updateConfirmationCodeAndExpiry(confirmationCode);

    await this.usersRepository.createUser(user);

    this.emailService
      .sendConfirmationEmail(dto.email, confirmationCode)
      .catch(console.error);
  }
}
