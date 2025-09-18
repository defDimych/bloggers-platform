import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { ConfirmEmailCodeDto } from '../../dto/confirm-email-code.dto';

export class EmailConfirmationCommand {
  constructor(public dto: ConfirmEmailCodeDto) {}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase
  implements ICommandHandler<EmailConfirmationCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute({ dto }: EmailConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(
      dto.code,
    );

    if (
      !user ||
      user.confirmation.isConfirmed ||
      user.confirmation.expirationDate < new Date()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          {
            message:
              'Confirmation code is incorrect, expired or already been applied',
            key: 'code',
          },
        ],
      });
    }

    user.confirmation.confirmEmail();

    await this.usersRepository.save(user);
  }
}
