import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class LoginInputDto {
  @Trim()
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;

  @Trim()
  @IsNotEmpty()
  @IsString()
  password: string;
}
