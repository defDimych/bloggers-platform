import { IsStringWithTrim } from '../../../core/decorators/validation/is-string-with-trim';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../core/decorators/transform/trim';
import { passwordConstraints } from '../../user-accounts/entities/user.entity';

export class ConfirmPassRecoveryDto {
  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  newPassword: string;

  @IsString()
  @Trim()
  @IsNotEmpty()
  recoveryCode: string;
}
