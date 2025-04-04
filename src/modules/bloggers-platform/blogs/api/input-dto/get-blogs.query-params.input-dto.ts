import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

enum BlogsSortBy {
  Name = 'name',
  CreatedAt = 'createdAt',
}

export class getBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
