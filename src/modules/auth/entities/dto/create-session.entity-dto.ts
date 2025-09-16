export class CreateSessionEntityDto {
  userId: number;
  deviceId: string;
  deviceName: string;
  IP: string;
  issuedAt: Date;
  expiresAt: Date;
}
