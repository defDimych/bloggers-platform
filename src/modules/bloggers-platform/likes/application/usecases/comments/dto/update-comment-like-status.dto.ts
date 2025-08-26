import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdateCommentLikeStatusDto {
  userId: string;
  commentId: number;
  likeStatus: LikeStatus;
}
