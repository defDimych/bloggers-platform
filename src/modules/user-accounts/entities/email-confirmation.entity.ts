import { BaseEntity } from '../../../core/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { add } from 'date-fns';

@Entity({ name: 'EmailConfirmations' })
export class EmailConfirmation extends BaseEntity {
  @OneToOne(() => User, (user) => user.confirmation)
  @JoinColumn()
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'uuid' })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone' })
  expirationDate: Date;

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;

  static create(): EmailConfirmation {
    const emailConfirmation = new this();

    emailConfirmation.confirmationCode = crypto.randomUUID();
    emailConfirmation.expirationDate = new Date();

    return emailConfirmation;
  }

  confirmEmail() {
    this.isConfirmed = true;
  }

  update(confirmationCode: string) {
    this.confirmationCode = confirmationCode;
    this.expirationDate = add(new Date(), {
      minutes: 5,
    });
  }
}
