import { LikeStatus } from '../../../types/like-status.enum';

export class UpdateLikeStatusDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
