import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ConfirmPassRecoveryDto } from '../../dto/confirm-pass-recovery.dto';
import { CryptoService } from '../services/crypto.service';

export class ConfirmPasswordRecoveryCommand {
  constructor(public dto: ConfirmPassRecoveryDto) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryUseCase
  implements ICommandHandler<ConfirmPasswordRecoveryCommand, void>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}
  async execute({ dto }: ConfirmPasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByPasswordRecoveryCode(
      dto.recoveryCode,
    );

    if (!user || user.recovery.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          {
            message: 'RecoveryCode is incorrect or expired',
            key: 'recoveryCode',
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.generateHash(dto.newPassword);

    user.setNewPasswordHash(passwordHash);

    await this.usersRepository.save(user);
  }
}
