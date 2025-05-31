import { LikeStatus } from '../../../types/like-status.enum';

export class CreateLikeDomainDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
