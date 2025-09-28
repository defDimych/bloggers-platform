import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export class BaseQueryParams {
  @Type(() => Number)
  @IsNumber()
  pageNumber: number = 1;

  @Type(() => Number)
  @IsNumber()
  pageSize: number = 10;

  @Transform(({ value }: { value: string | undefined }) =>
    value ? value.toUpperCase() : undefined,
  )
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

// export abstract class baseSortablePaginationParams<T> extends PaginationParams {
//   sortDirection: SortDirection = SortDirection.Desc;
//   abstract sortBy: T;
// }
