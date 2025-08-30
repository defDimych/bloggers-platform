import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class CreatePostLikeDto {
  userId: string;
  postId: number;
  likeStatus: LikeStatus;
}
