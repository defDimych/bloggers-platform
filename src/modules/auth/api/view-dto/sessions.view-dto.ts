import { SessionDbModel } from '../../infrastructure/types/session-db-model.type';

export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView = (sessions: SessionDbModel[]): SessionsViewDto[] => {
    return sessions.map((s) => {
      return {
        ip: s.IP,
        title: s.deviceName,
        lastActiveDate: s.iat,
        deviceId: s.deviceId,
      };
    });
  };
}
