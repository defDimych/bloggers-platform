import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { add } from 'date-fns';
import { NumericBaseEntity } from '../../../core/entities/numeric-base.entity';

@Entity({ name: 'EmailConfirmations' })
export class EmailConfirmation extends NumericBaseEntity {
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

  updateConfirmationCodeAndExpiry(confirmationCode: string) {
    this.confirmationCode = confirmationCode;
    this.expirationDate = add(new Date(), {
      minutes: 5,
    });
  }
}
