import { SessionDocument } from '../../domain/session.entity';

export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView = (sessions: SessionDocument[]): SessionsViewDto[] => {
    return sessions.map((s) => {
      return {
        ip: s.IP,
        title: s.deviceName,
        lastActiveDate: s.iat.toISOString(),
        deviceId: s.deviceId,
      };
    });
  };
}
