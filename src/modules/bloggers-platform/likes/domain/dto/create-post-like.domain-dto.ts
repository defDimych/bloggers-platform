import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreatePostLikeDomainDto {
  userId: string;
  userLogin: string;
  postId: string;
  likeStatus: LikeStatus;
}
