import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdateCommentLikeStatusDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
