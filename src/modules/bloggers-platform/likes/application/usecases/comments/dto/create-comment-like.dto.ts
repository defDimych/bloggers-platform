import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class CreateCommentLikeDto {
  userId: string;
  commentId: number;
  likeStatus: LikeStatus;
}
