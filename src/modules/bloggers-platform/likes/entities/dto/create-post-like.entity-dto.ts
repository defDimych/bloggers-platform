import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreatePostLikeEntityDto {
  userId: number;
  postId: number;
  likeStatus: LikeStatus;
}
