import { IsUUID } from 'class-validator';

export class ConfirmEmailCodeDto {
  @IsUUID()
  code: string;
}
