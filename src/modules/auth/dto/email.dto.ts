import { IsEmail, IsString } from 'class-validator';
import { Trim } from '../../../core/decorators/transform/trim';

export class EmailDto {
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
