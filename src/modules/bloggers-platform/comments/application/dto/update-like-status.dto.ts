import { LikeStatus } from '../../../common/types/like-status.enum';

export class UpdateLikeStatusDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
