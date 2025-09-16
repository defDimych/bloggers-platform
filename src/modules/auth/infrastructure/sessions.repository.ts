import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SessionDbModel } from './types/session-db-model.type';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  async createSession(session: Session): Promise<void> {
    await this.sessionsRepo.save(session);
  }

  async findByDeviceId(deviceId: string): Promise<SessionDbModel | null> {
    const result = await this.dataSource.query<SessionDbModel[]>(
      `SELECT * FROM "Sessions" WHERE "deviceId" = $1 AND "deletedAt" IS NULL`,
      [deviceId],
    );

    return result.length === 1 ? result[0] : null;
  }

  async makeDeletedAllUserSessionsExcludingCurrentOne(dto: {
    deviceId: string;
    userId: number;
  }): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Sessions"
      SET "deletedAt" = now()
      WHERE "userId" = $1
        AND "deviceId" <> $2
        AND "deletedAt" IS NULL;`,
      [dto.userId, dto.deviceId],
    );
  }

  async findSession(dto: {
    iat: Date;
    deviceId: string;
    userId: number;
  }): Promise<SessionDbModel | null> {
    const result = await this.dataSource.query<SessionDbModel[]>(
      `SELECT * FROM "Sessions"
      WHERE ("userId", "deviceId", iat) = ($1, $2, $3)
      AND "deletedAt" IS NULL`,
      [dto.userId, dto.deviceId, dto.iat],
    );

    return result.length === 1 ? result[0] : null;
  }

  async updateTokenVersion(dto: {
    sessionId: number;
    iat: Date;
  }): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Sessions" SET iat = $1 WHERE id = $2`,
      [dto.iat, dto.sessionId],
    );
  }

  async makeDeleted(sessionId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Sessions" SET "deletedAt" = now() WHERE id = $1`,
      [sessionId],
    );
  }
}
