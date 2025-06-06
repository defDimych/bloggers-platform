import { LikeStatus } from '../../../common/types/like-status.enum';

export class UpdateLikesCountDto {
  commentId: string;
  likeStatus: LikeStatus;
  currentStatus: LikeStatus;
}
