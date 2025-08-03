import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { add } from 'date-fns';
import { UsersFactory } from '../../../user-accounts/application/factories/users.factory';

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
    const userId = await this.usersFactory.create(dto);

    const emailConfirmationDetails = {
      userId,
      confirmationCode: crypto.randomUUID(),
      expirationDate: add(new Date(), {
        minutes: 5,
      }),
      isConfirmed: false,
    };

    await this.usersRepository.setEmailConfirmationDetails(
      emailConfirmationDetails,
    );

    this.emailService
      .sendConfirmationEmail(
        dto.email,
        emailConfirmationDetails.confirmationCode,
      )
      .catch(console.error);
  }
}
