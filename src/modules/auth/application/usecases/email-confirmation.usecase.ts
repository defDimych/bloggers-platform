import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';

export class EmailConfirmationCommand {
  constructor(public dto: { code: string }) {}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase
  implements ICommandHandler<EmailConfirmationCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute({ dto }: EmailConfirmationCommand): Promise<void> {
    const emailConfirmationDetails =
      await this.usersRepository.findEmailConfirmDetailsByConfirmCode(dto.code);

    if (
      !emailConfirmationDetails ||
      emailConfirmationDetails.isConfirmed ||
      // TODO sql запрос возвращает строку, нужен ли маппинг в репо?
      new Date(emailConfirmationDetails.expirationDate) < new Date()
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

    await this.usersRepository.updateEmailConfirmed(
      emailConfirmationDetails.id,
    );
  }
}
