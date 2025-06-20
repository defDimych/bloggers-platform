import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdatePostLikeCounterDto {
  postId: string;
  likeStatus: LikeStatus;
  currentStatus: LikeStatus;
}
