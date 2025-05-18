import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../infrastructure/users.repository';

export class EmailConfirmationCommand {
  constructor(public dto: { code: string }) {}
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase
  implements ICommandHandler<EmailConfirmationCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute({ dto }: EmailConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(dto.code);

    if (
      !user ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < new Date()
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

    user.confirmEmail();

    await this.usersRepository.save(user);
  }
}
