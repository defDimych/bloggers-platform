import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { EmailService } from '../../../notifications/email.service';
import { EmailDto } from '../../dto/email.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { add } from 'date-fns';

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
    const user: { id: number } | null =
      await this.usersRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [{ message: 'email not found', key: 'email' }],
      });
    }

    const emailConfirmationDetails: { id: number; isConfirmed: boolean } =
      await this.usersRepository.findEmailConfirmDetailsByUserIdOrThrow(
        user.id,
      );

    if (emailConfirmationDetails.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'The account has already been activated', key: 'email' },
        ],
      });
    }

    const newEmailConfirmDetails = {
      confirmCode: crypto.randomUUID(),
      exp: add(new Date(), {
        minutes: 5,
      }),
    };

    await this.usersRepository.updateEmailConfirmCodeAndExpiry({
      id: emailConfirmationDetails.id,
      ...newEmailConfirmDetails,
    });

    this.emailService
      .sendConfirmationEmail(dto.email, newEmailConfirmDetails.confirmCode)
      .catch(console.error);
  }
}
