import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GamesStats } from '../../entities/game-stats.entity';
import { StatsRawType } from './stats-raw.type';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GamesStatsViewDto } from '../../api/view-dto/games-stats.view-dto';

@Injectable()
export class GamesStatsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyStatistic(dto: { userId: string }) {
    const userId = Number(dto.userId);

    const builder = this.dataSource
      .getRepository(GamesStats)
      .createQueryBuilder('gs')
      .select([
        'gs.sumScore as "sumScore"',
        'gs.winsCount as "winsCount"',
        'gs.lossesCount as "lossesCount"',
        'gs.drawsCount as "drawsCount"',
        'gs.gamesCount as "gamesCount"',
      ])
      .where('gs.userId = :userId', { userId });

    const stats = await builder.getRawOne<StatsRawType>();

    if (!stats) {
      throw new DomainException({
        message: `Sorry, statistics by userId:${userId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const avgScores = this.roundSmart(stats.sumScore / stats.gamesCount);

    return GamesStatsViewDto.mapToView(stats, avgScores);
  }

  private roundSmart(value: number): number {
    const fixed = value.toFixed(2);

    if (fixed.endsWith('00')) {
      return parseInt(fixed, 10);
    }

    return parseFloat(fixed);
  }
}
