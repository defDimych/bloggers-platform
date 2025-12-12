import { Injectable } from '@nestjs/common';
import { GamesStatsRepository } from '../infrastructure/games-stats.repository';
import { Player } from '../entities/player.entity';
import { GamesStats } from '../entities/game-stats.entity';

enum FinishStatus {
  Win = 'Win',
  Loss = 'Loss',
  Draw = 'Draw',
}

@Injectable()
export class GamesStatsService {
  constructor(private gamesStatsRepository: GamesStatsRepository) {}
  // Основной входной метод
  async recordStatistic(dto: {
    currentPlayer: Player;
    opponentPlayer: Player;
  }) {
    const { currentPlayer, opponentPlayer } = dto;

    const gameResult = this.determineResult(
      currentPlayer.score,
      opponentPlayer.score,
    );

    await Promise.all([
      this.updateStats(
        currentPlayer.userId,
        currentPlayer.score,
        gameResult.current,
      ),
      this.updateStats(
        opponentPlayer.userId,
        opponentPlayer.score,
        gameResult.opponent,
      ),
    ]);
  }

  // Определение результата игры для игроков
  private determineResult(
    currentScore: number,
    opponentScore: number,
  ): { current: FinishStatus; opponent: FinishStatus } {
    if (currentScore > opponentScore) {
      return { current: FinishStatus.Win, opponent: FinishStatus.Loss };
    }

    if (currentScore < opponentScore) {
      return { current: FinishStatus.Loss, opponent: FinishStatus.Win };
    }

    return { current: FinishStatus.Draw, opponent: FinishStatus.Draw };
  }

  // Обновление статистики для конкретного игрока
  private async updateStats(
    userId: number,
    gainedScore: number,
    gameResult: FinishStatus,
  ): Promise<void> {
    const stats = await this.getOrCreate(userId);

    this.applyResult(stats, gameResult);
    stats.incrementScore(gainedScore);
    stats.incrementGamesCount();

    await this.gamesStatsRepository.save(stats);
  }

  // Получить статистику, или создать
  private async getOrCreate(userId: number): Promise<GamesStats> {
    const stats = await this.gamesStatsRepository.findByUserId(userId);

    if (!stats) {
      return GamesStats.create(userId);
    }
    return stats;
  }

  // инкрементируем winsCount, lossesCount...
  private applyResult(stats: GamesStats, gameResult: FinishStatus) {
    switch (gameResult) {
      case FinishStatus.Win:
        stats.winsCount++;
        break;

      case FinishStatus.Loss:
        stats.lossesCount++;
        break;

      case FinishStatus.Draw:
        stats.drawsCount++;
        break;
    }
  }
}
