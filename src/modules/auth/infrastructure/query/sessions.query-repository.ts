import { Injectable } from '@nestjs/common';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionDbModel } from '../types/session-db-model.type';

@Injectable()
export class SessionsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(userId: number): Promise<SessionsViewDto[]> {
    const sessions = await this.dataSource.query<SessionDbModel[]>(
      `SELECT * FROM "Sessions" WHERE "userId" = $1 AND "deletedAt" IS NULL`,
      [userId],
    );

    return SessionsViewDto.mapToView(sessions);
  }
}
