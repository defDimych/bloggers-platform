import { IsNotEmpty } from 'class-validator';

export class ClientDetailsDto {
  IP: string;

  @IsNotEmpty()
  deviceName: string;
}
