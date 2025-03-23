import { BaseQueryParams } from '../../../../core/base.query-params.input-dto';

enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class GetUsersQueryParams extends BaseQueryParams {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
