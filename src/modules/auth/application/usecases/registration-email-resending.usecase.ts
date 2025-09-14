import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { EmailDto } from '../../dto/email.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class RegistrationEmailResendingCommand {
  constructor(public dto: EmailDto) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute({ dto }: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [{ message: 'email not found', key: 'email' }],
      });
    }

    if (user.confirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'The account has already been activated', key: 'email' },
        ],
      });
    }

    const confirmationCode: string = crypto.randomUUID();

    user.confirmation.update(confirmationCode);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(dto.email, confirmationCode)
      .catch(console.error);
  }
}
