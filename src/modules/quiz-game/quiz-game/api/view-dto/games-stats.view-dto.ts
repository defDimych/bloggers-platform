import { GamesStats } from '../../entities/game-stats.entity';

export class GamesStatsViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(stats: GamesStats): GamesStatsViewDto {
    const viewDto = new this();

    viewDto.sumScore = stats.sumScore;
    viewDto.avgScores = Number(stats.avgScores);
    viewDto.gamesCount = stats.gamesCount;
    viewDto.winsCount = stats.winsCount;
    viewDto.lossesCount = stats.lossesCount;
    viewDto.drawsCount = stats.drawsCount;

    return viewDto;
  }
}
