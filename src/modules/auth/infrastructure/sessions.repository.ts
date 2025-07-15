import { Injectable } from '@nestjs/common';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../domain/session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}
  async save(session: SessionDocument): Promise<void> {
    await session.save();
  }

  async saveMany(sessions: SessionDocument[]): Promise<void> {
    await this.SessionModel.create(sessions);
  }

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId, deletedAt: null });
  }

  async findAllUserSessionsExcludingCurrentOne(
    userId: string,
    deviceId: string,
  ): Promise<SessionDocument[]> {
    return this.SessionModel.find({ userId, deviceId: { $ne: deviceId } });
  }

  async findSession(dto: {
    iat: Date;
    deviceId: string;
    userId: string;
  }): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({
      userId: dto.userId,
      deviceId: dto.deviceId,
      iat: dto.iat,
      deletedAt: null,
    });
  }

  async findById(id: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ _id: id, deletedAt: null });
  }
}
