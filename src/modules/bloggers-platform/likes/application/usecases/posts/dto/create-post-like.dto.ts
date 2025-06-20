import { LikeStatus } from '../../../../../common/types/like-status.enum';

export class CreatePostLikeDto {
  userId: string;
  postId: string;
  likeStatus: LikeStatus;
}
