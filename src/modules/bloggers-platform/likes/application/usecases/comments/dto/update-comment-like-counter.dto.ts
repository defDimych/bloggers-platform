import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdateCommentLikeCounterDto {
  commentId: string;
  likeStatus: LikeStatus;
  currentStatus: LikeStatus;
}
