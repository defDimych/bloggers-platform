import { GetCommentsQueryParams } from '../../../../posts/api/input-dto/get-comments-query-params.input-dto';

export class GetAllCommentsDto {
  query: GetCommentsQueryParams;
  userId: string | null;
  postId: string;
}
