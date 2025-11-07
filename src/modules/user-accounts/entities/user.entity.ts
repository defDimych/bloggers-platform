import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { CreateUserEntityDto } from './dto/create-user.entity-dto';
import { EmailConfirmation } from './email-confirmation.entity';
import { PasswordRecovery } from './password-recovery.entity';
import { Session } from '../../auth/entities/session.entity';
import { Comment } from '../../bloggers-platform/comments/entities/comment.entity';
import { CommentLike } from '../../bloggers-platform/likes/entities/comment-like.entity';
import { PostLike } from '../../bloggers-platform/likes/entities/post-like.entity';
import { NumericBaseEntity } from '../../../core/entities/numeric-base.entity';
import { Player } from '../../quiz-game/quiz-game/entities/player.entity';

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
export class User extends NumericBaseEntity {
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

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user)
  commentLikes: CommentLike[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];

  @OneToMany(() => Player, (player) => player.user)
  players: Player[];

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
