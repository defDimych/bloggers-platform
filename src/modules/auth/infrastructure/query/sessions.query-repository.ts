import { Injectable } from '@nestjs/common';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Session } from '../../entities/session.entity';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
  ) {}

  async findAllSessionsByUserId(userId: number): Promise<SessionsViewDto[]> {
    const sessions = await this.sessionsRepo.find({
      where: { userId, deletedAt: IsNull() },
    });

    return SessionsViewDto.mapToView(sessions);
  }
}
