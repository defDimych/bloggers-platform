import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../../domain/session.entity';
import { SessionsViewDto } from '../../api/view-dto/sessions.view-dto';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async getAll(userId: string): Promise<SessionsViewDto[]> {
    const sessions = await this.SessionModel.find({ userId, deletedAt: null });

    return SessionsViewDto.mapToView(sessions);
  }
}
