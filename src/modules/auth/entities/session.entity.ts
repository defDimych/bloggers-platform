import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user-accounts/entities/user.entity';
import { CreateSessionEntityDto } from './dto/create-session.entity-dto';

@Entity({ name: 'Sessions' })
export class Session {
  @PrimaryColumn({ type: 'uuid' })
  deviceId: string;

  @ManyToOne(() => User, (user) => user.sessions, { nullable: false })
  user: User;

  @Column()
  userId: number;

  @Column()
  deviceName: string;

  @Column()
  IP: string;

  @Column({ type: 'timestamp with time zone' })
  issuedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

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

  updateIssueDate(iat: Date): void {
    this.issuedAt = iat;
  }
}
