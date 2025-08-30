import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class UpdatePostLikeStatusDto {
  userId: string;
  postId: number;
  likeStatus: LikeStatus;
}
