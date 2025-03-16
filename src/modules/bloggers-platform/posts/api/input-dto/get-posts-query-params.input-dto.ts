import { baseSortablePaginationParams } from '../../../../../core/base.query-params.input-dto';

enum PostsSortBy {
  Title = 'title',
  CreatedAt = 'createdAt',
}
export class getPostsQueryParams extends baseSortablePaginationParams<PostsSortBy> {
  sortBy = PostsSortBy.CreatedAt;
}
