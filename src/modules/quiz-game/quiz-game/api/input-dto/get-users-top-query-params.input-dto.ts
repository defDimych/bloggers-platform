import { Transform, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { IsValidSort } from '../decorators/is-valid-sort';

enum GamesStatsSortBy {
  SumScore = 'sumScore',
  AvgScores = 'avgScores',
  GamesCount = 'gamesCount',
  WinsCount = 'winsCount',
  LossesCount = 'lossesCount',
  DrawsCount = 'drawsCount',
}

export class GetUsersTopQueryParams {
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;

  @Type(() => Number)
  @IsNumber()
  pageSize: number = 10;

  @Transform(({ value }: { value: string | string[] }): string[] => {
    return Array.isArray(value) ? value : [value];
  })
  @IsValidSort(GamesStatsSortBy, SortDirection)
  sort: string[] = [
    `${GamesStatsSortBy.AvgScores} ${SortDirection.Desc}`,
    `${GamesStatsSortBy.SumScore} ${SortDirection.Desc}`,
  ];

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
