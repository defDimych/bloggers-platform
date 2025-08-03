export class CreateSessionDto {
  userId: number;
  deviceId: string;
  deviceName: string;
  IP: string;
  iat: Date;
  exp: Date;
}
