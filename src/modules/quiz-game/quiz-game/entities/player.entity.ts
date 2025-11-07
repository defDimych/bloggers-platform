import { UuidBaseEntity } from '../../../../core/entities/uuid-base.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { Game } from './game.entity';
import { User } from '../../../user-accounts/entities/user.entity';

@Entity({ name: 'Players' })
export class Player extends UuidBaseEntity {
  @Column({ type: 'integer', default: 0 })
  score: number;

  @OneToOne(() => Game, (game) => game.firstPlayer)
  gameAsFirstPlayer: Game;

  @OneToOne(() => Game, (game) => game.secondPlayer)
  gameAsSecondPlayer: Game;

  @ManyToOne(() => User, (user) => user.players)
  user: User;

  @Column()
  userId: number;

  static create(userId: number): Player {
    const player = new this();

    player.userId = userId;

    return player;
  }
}
