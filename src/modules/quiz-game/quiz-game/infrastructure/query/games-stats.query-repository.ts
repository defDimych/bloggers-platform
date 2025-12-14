import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GamesStats } from '../../entities/game-stats.entity';
import { GamesStatsViewDto } from '../../api/view-dto/games-stats.view-dto';

@Injectable()
export class GamesStatsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyStatistic(dto: { userId: string }) {
    const userId = Number(dto.userId);

    const stats = await this.dataSource.getRepository(GamesStats).findOneBy({
      userId,
    });

    if (!stats) {
      return {
        sumScore: 0,
        avgScores: 0,
        gamesCount: 0,
        winsCount: 0,
        lossesCount: 0,
        drawsCount: 0,
      };
    }

    return GamesStatsViewDto.mapToView(stats);
  }
}
