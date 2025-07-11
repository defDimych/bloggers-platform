import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDomainDto } from './dto/create-session.domain-dto';

@Schema()
export class Session {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: String, required: true })
  IP: string;

  @Prop({ type: Date, required: true })
  iat: Date;

  @Prop({ type: Date, required: true })
  exp: Date;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(dto: CreateSessionDomainDto): SessionDocument {
    const session = new this();
    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;
    session.IP = dto.IP;
    session.iat = dto.iat;
    session.exp = dto.exp;
    session.deletedAt = null;

    return session as SessionDocument;
  }

  updateIssueDate(iat: Date): void {
    this.iat = iat;
  }

  makeDeleted(): void {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

//регистрирует методы сущности в схеме
SessionSchema.loadClass(Session);

export type SessionDocument = HydratedDocument<Session>;

//типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof Session;
