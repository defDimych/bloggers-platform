import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { GameStatus } from '../common/game-status.enum';
import { Player } from './player.entity';
import { GameQuestion } from './game-question.entity';
import { NumericBaseEntity } from '../../../../core/entities/numeric-base.entity';

@Entity({ name: 'Games' })
export class Game extends NumericBaseEntity {
  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PendingSecondPlayer,
  })
  status: GameStatus;

  @OneToOne(() => Player, (player) => player.gameAsFirstPlayer)
  @JoinColumn()
  firstPlayer: Player;

  @Column()
  firstPlayerId: string;

  @OneToOne(() => Player, (player) => player.gameAsSecondPlayer)
  @JoinColumn()
  secondPlayer: Player | null;

  @Column({ nullable: true })
  secondPlayerId: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishedAt: Date | null;

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  gameQuestions: GameQuestion[];

  static create(playerId: string): Game {
    const game = new this();

    game.firstPlayerId = playerId;

    return game;
  }

  addSecondPlayer(playerId: string): void {
    this.secondPlayerId = playerId;
  }

  switchGameStatusToActiveAndStartGame(): void {
    this.status = GameStatus.Active;
    this.startedAt = new Date();
  }

  switchGameStatusToFinished(): void {
    this.status = GameStatus.Finished;
    this.finishedAt = new Date();
  }
}
