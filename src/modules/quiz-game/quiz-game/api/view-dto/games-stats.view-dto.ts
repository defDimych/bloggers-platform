import { GamesStats } from '../../entities/game-stats.entity';
import { GamesStatsRawType } from '../../infrastructure/query/types/games-stats-raw.type';

type Player = {
  id: string;
  login: string;
};

export class GamesStatsViewDto {
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player?: Player;

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

  static mapRawToView = (statsRaw: GamesStatsRawType): GamesStatsViewDto => {
    const viewDto = new this();

    viewDto.sumScore = statsRaw.sumScore;
    viewDto.avgScores = Number(statsRaw.avgScores);
    viewDto.gamesCount = statsRaw.gamesCount;
    viewDto.winsCount = statsRaw.winsCount;
    viewDto.lossesCount = statsRaw.lossesCount;
    viewDto.drawsCount = statsRaw.drawsCount;
    viewDto.player = {
      id: statsRaw.userId.toString(),
      login: statsRaw.userLogin,
    };

    return viewDto;
  };
}
