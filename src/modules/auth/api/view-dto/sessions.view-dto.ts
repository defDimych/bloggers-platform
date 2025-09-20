import { Session } from '../../entities/session.entity';

export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView = (sessions: Session[]): SessionsViewDto[] => {
    return sessions.map((s) => {
      return {
        ip: s.IP,
        title: s.deviceName,
        lastActiveDate: s.issuedAt.toISOString(),
        deviceId: s.deviceId,
      };
    });
  };
}
