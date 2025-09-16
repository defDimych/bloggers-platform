import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../user-accounts/entities/user.entity';
import { CreateSessionEntityDto } from './dto/create-session.entity-dto';
import { BaseEntity } from '../../../core/entities/base.entity';

@Entity({ name: 'Sessions' })
export class Session extends BaseEntity {
  @ManyToOne(() => User, (user) => user.sessions, { nullable: false })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column()
  deviceName: string;

  @Column()
  IP: string;

  @Column({ type: 'timestamp with time zone' })
  issuedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  static create(dto: CreateSessionEntityDto): Session {
    const session = new this();

    session.userId = dto.userId;
    session.deviceId = dto.deviceId;
    session.deviceName = dto.deviceName;
    session.IP = dto.IP;
    session.issuedAt = dto.issuedAt;
    session.expiresAt = dto.expiresAt;

    return session;
  }
}
