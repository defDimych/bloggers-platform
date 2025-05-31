import { LikeStatus } from '../../../types/like-status.enum';

export class UpdateLikesCountDto {
  commentId: string;
  likeStatus: LikeStatus;
  currentStatus: LikeStatus;
}
