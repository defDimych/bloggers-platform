import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  async findSessionByDeviceId(deviceId: string): Promise<Session | null> {
    return this.sessionsRepo.findOne({
      where: { deviceId, deletedAt: IsNull() },
    });
  }

  async findUserSessionsExcludingCurrentOne(dto: {
    deviceId: string;
    userId: number;
  }): Promise<Session[]> {
    return this.sessionsRepo.find({
      where: {
        userId: dto.userId,
        deviceId: Not(dto.deviceId),
        deletedAt: IsNull(),
      },
    });
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
      where: { issuedAt: dto.iat, deviceId: dto.deviceId, deletedAt: IsNull() },
    });
  }

  async save(session: Session): Promise<void> {
    await this.sessionsRepo.save(session);
  }
}
