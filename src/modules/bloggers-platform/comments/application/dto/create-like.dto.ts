import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreateLikeDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
