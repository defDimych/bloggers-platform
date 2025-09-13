import { BaseEntity } from '../../../core/entities/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { CreateUserEntityDto } from './dto/create-user.entity-dto';
import { EmailConfirmation } from './email-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';

export const loginConstraints = {
  minLength: 3,
  maxLength: 10,
};

// TODO: входная валидация
export const emailConstraints = {
  match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export const passwordConstraints = {
  minLength: 6,
  maxLength: 20,
};

@Entity({ name: 'Users' })
export class User extends BaseEntity {
  @Column({
    type: 'varchar',
    length: loginConstraints.maxLength,
    unique: true,
    collation: 'C',
  })
  login: string;

  @Column({ type: 'varchar', unique: true, collation: 'C' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @OneToOne(
    () => EmailConfirmation,
    (emailConfirmation) => emailConfirmation.user,
    { cascade: true },
  )
  confirmation: EmailConfirmation;

  @OneToOne(
    () => PasswordRecovery,
    (passwordRecovery) => passwordRecovery.user,
    { cascade: true },
  )
  recovery: PasswordRecovery;

  static create(dto: CreateUserEntityDto): User {
    const user = new this();

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.recovery = PasswordRecovery.create();
    user.confirmation = EmailConfirmation.create();

    return user;
  }

  setNewPasswordHash(passwordHash: string) {
    this.passwordHash = passwordHash;
  }
}
