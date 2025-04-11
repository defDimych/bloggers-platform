import { IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class LoginInputDto {
  @Trim()
  @IsString()
  loginOrEmail: string;

  @Trim()
  @IsString()
  password: string;
}
