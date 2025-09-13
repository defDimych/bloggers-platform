import { BaseEntity } from '../../../core/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { add } from 'date-fns';

@Entity({ name: 'PasswordRecoveries' })
export class PasswordRecovery extends BaseEntity {
  @OneToOne(() => User, (user) => user.recovery)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'uuid' })
  recoveryCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  static create(): PasswordRecovery {
    const passwordRecovery = new this();

    passwordRecovery.recoveryCode = crypto.randomUUID();
    passwordRecovery.expirationDate = new Date();

    return passwordRecovery;
  }

  update(recoveryCode: string) {
    this.recoveryCode = recoveryCode;
    this.expirationDate = add(new Date(), {
      minutes: 5,
    });
  }
}
