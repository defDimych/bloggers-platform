import { IsStringWithTrim } from '../../../core/decorators/validation/is-string-with-trim';
import { passwordConstraints } from '../../user-accounts/domain/account-data.schema';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../core/decorators/transform/trim';

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
