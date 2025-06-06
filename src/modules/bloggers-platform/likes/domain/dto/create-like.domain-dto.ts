import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreateLikeDomainDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
