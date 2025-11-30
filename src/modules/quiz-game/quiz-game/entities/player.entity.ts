import { UuidBaseEntity } from '../../../../core/entities/uuid-base.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Game } from './game.entity';
import { User } from '../../../user-accounts/entities/user.entity';
import { Answer } from './answer.entity';

@Entity({ name: 'Players' })
export class Player extends UuidBaseEntity {
  @Column({ type: 'integer', default: 0 })
  score: number;

  @OneToOne(() => Game, (game) => game.firstPlayer)
  gameAsFirstPlayer: Game | null;

  @OneToOne(() => Game, (game) => game.secondPlayer)
  gameAsSecondPlayer: Game | null;

  @ManyToOne(() => User, (user) => user.players)
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Answer, (answer) => answer.player)
  answers: Answer[];

  static create(userId: number): Player {
    const player = new this();

    player.userId = userId;

    return player;
  }

  incrementScore() {
    this.score += 1;
  }
}
