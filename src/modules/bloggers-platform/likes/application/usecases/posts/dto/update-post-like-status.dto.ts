import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdatePostLikeStatusDto {
  userId: string;
  postId: string;
  likeStatus: LikeStatus;
}
