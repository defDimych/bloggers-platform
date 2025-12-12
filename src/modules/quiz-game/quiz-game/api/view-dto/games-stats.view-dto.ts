import { StatsRawType } from '../../infrastructure/query/stats-raw.type';

export class GamesStatsViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;

  static mapToView(
    statsRaw: StatsRawType,
    avgScores: number,
  ): GamesStatsViewDto {
    const viewDto = new this();

    viewDto.sumScore = statsRaw.sumScore;
    viewDto.avgScores = avgScores;
    viewDto.gamesCount = statsRaw.gamesCount;
    viewDto.winsCount = statsRaw.winsCount;
    viewDto.lossesCount = statsRaw.lossesCount;
    viewDto.drawsCount = statsRaw.drawsCount;

    return viewDto;
  }
}
