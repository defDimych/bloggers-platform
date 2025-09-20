import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    return this.sessionsRepo.findOne({
      where: { deviceId },
      withDeleted: false,
    });
  }

  async createSession(session: Session): Promise<void> {
    await this.sessionsRepo.save(session);
  }

  async makeDeletedAllUserSessionsExcludingCurrentOne(dto: {
    deviceId: string;
    userId: number;
  }): Promise<void> {
    await this.sessionsRepo.softDelete({
      userId: dto.userId,
      deviceId: Not(dto.deviceId),
    });
  }

  async findSessionByDeviceIdAndVersion(dto: {
    iat: Date;
    deviceId: string;
  }): Promise<Session | null> {
    return this.sessionsRepo.findOne({
      where: { issuedAt: dto.iat, deviceId: dto.deviceId },
      withDeleted: false,
    });
  }

  async makeDeleted(deviceId: string): Promise<void> {
    await this.sessionsRepo.softDelete({ deviceId });
  }

  async save(session: Session): Promise<void> {
    await this.sessionsRepo.save(session);
  }
}
