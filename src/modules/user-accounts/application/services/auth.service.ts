import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../../guards/dto/user-context.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { EmailDto } from '../../dto/email.dto';
import { EmailService } from '../../../notifications/email.service';
import { ConfirmPassRecoveryDto } from '../../dto/confirm-pass-recovery.dto';
import { AuthConfig } from '../../config/auth.config';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
    private authConfig: AuthConfig,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return null;
    }

    // Проверка SKIP_PASSWORD_CHECK
    if (!this.authConfig.skipPasswordCheck) {
      const isPasswordValid = await this.cryptoService.comparePasswords({
        password,
        hash: user.accountData.passwordHash,
      });

      if (!isPasswordValid) {
        return null;
      }
    }
    return { id: user._id.toString() };
  }

  async emailConfirmation(dto: { code: string }): Promise<void> {
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

  async registrationEmailResending(dto: EmailDto): Promise<void> {
    const user = await this.usersRepository.findByEmail(dto.email);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [{ message: 'email not found', key: 'email' }],
      });
    }

    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Validation failed',
        extensions: [
          { message: 'The account has already been activated', key: 'email' },
        ],
      });
    }

    const confirmationCode = crypto.randomUUID();

    user.setConfirmationCode(confirmationCode);
    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.accountData.email, confirmationCode)
      .catch(console.error);
  }

  async passwordRecovery(dto: EmailDto): Promise<void> {
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

  async confirmPasswordRecovery(dto: ConfirmPassRecoveryDto): Promise<void> {
    const user = await this.usersRepository.findByPasswordRecoveryCode(
      dto.recoveryCode,
    );

    if (!user || user.passwordRecovery.expirationDate < new Date()) {
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

    user.setNewPassword(passwordHash);
    await this.usersRepository.save(user);
  }
}
