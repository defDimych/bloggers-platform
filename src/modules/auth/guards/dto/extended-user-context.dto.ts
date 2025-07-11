/**
 * user object for the jwt token and for transfer from the request object
 */
export class ExtendedUserContextDto {
  userId: string;
  deviceId: string;
  sessionId: string;
}
