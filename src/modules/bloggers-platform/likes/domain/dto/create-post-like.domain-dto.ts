import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreatePostLikeDomainDto {
  userId: string;
  postId: string;
  likeStatus: LikeStatus;
}
