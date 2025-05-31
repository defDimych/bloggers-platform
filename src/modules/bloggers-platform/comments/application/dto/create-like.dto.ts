import { LikeStatus } from '../../../types/like-status.enum';

export class CreateLikeDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
