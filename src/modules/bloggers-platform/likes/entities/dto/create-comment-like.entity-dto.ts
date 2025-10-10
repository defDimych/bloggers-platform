import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreateCommentLikeEntityDto {
  userId: number;
  commentId: number;
  likeStatus: LikeStatus;
}
