import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

enum PostsSortBy {
  Title = 'title',
  CreatedAt = 'createdAt',
}
export class getPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
