import { IsStringWithTrim } from '../../../core/decorators/validation/is-string-with-trim';
import {
  loginConstraints,
  passwordConstraints,
} from '../domain/account-data.schema';
import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../../core/decorators/transform/trim';

export class CreateUserDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  login: string;

  @IsStringWithTrim(
    passwordConstraints.minLength,
    passwordConstraints.maxLength,
  )
  password: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
