import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GamesStats } from '../../entities/game-stats.entity';
import { GamesStatsViewDto } from '../../api/view-dto/games-stats.view-dto';
import { GetUsersTopQueryParams } from '../../api/input-dto/get-users-top-query-params.input-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { GamesStatsRawType } from './types/games-stats-raw.type';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

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

  async getUsersTop(
    queryParams: GetUsersTopQueryParams,
  ): Promise<PaginatedViewDto<GamesStatsViewDto[]>> {
    const builder = this.dataSource
      .getRepository(GamesStats)
      .createQueryBuilder('gs')
      .select([
        'gs.sumScore as "sumScore"',
        'gs.avgScores as "avgScores"',
        'gs.winsCount as "winsCount"',
        'gs.lossesCount as "lossesCount"',
        'gs.drawsCount as "drawsCount"',
        'gs.gamesCount as "gamesCount"',
      ])
      .innerJoin('gs.user', 'u')
      .addSelect(['u.id as "userId"', 'u.login as "userLogin"']);

    for (const item of queryParams.sort) {
      const [sortBy, direction] = item.split(' ');

      builder.addOrderBy(
        `gs."${sortBy}"`,
        direction.toUpperCase() as SortDirection,
      );
    }

    builder.limit(queryParams.pageSize).offset(queryParams.calculateSkip());

    const [gamesStats, totalCount] = await Promise.all([
      builder.getRawMany<GamesStatsRawType>(),
      builder.getCount(),
    ]);

    const items = gamesStats.map(GamesStatsViewDto.mapRawToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: queryParams.pageNumber,
      size: queryParams.pageSize,
    });
  }
}
