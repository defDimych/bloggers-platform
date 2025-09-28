import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

enum PostsSortBy {
  Title = 'title',
  CreatedAt = 'createdAt',
  BlogName = 'blogName',
}
export class getPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
