import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export enum GamesSortBy {
  PairCreatedDate = 'pairCreatedDate',
}

export class GetGamesQueryParams extends BaseQueryParams {
  sortBy = GamesSortBy.PairCreatedDate;
}
