import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../user-accounts/entities/user.entity';

@Entity({ name: 'GamesStats' })
export class GamesStats {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'integer' })
  gamesCount: number;

  @Column({ type: 'integer' })
  sumScore: number;

  // При получении из БД тип string. Причина: чтобы не терять точность
  @Column({ type: 'numeric' })
  avgScores: number | string;

  @Column({ type: 'integer' })
  winsCount: number;

  @Column({ type: 'integer' })
  lossesCount: number;

  @Column({ type: 'integer' })
  drawsCount: number;

  static create(userId: number): GamesStats {
    const gamesStats = new this();

    gamesStats.userId = userId;
    gamesStats.gamesCount = 0;
    gamesStats.sumScore = 0;
    gamesStats.avgScores = 0;
    gamesStats.winsCount = 0;
    gamesStats.lossesCount = 0;
    gamesStats.drawsCount = 0;

    return gamesStats;
  }

  incrementScore(gainedScore: number) {
    this.sumScore += gainedScore;
  }

  incrementGamesCount() {
    this.gamesCount += 1;
  }

  updateAvgScores(avgScores: number) {
    this.avgScores = avgScores;
  }
}
