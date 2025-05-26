import { EmailDto } from '../../dto/email.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';

export class PasswordRecoveryCommand {
  constructor(public dto: EmailDto) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) return;

    const confirmationCode = crypto.randomUUID();

    user.setConfirmationCodeForPasswordRecovery(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendEmailForPasswordRecovery(
        dto.email,
        user.passwordRecovery.recoveryCode,
      )
      .catch(console.error);
  }
}
