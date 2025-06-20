import { LikeStatus } from '../../../common/types/like-status.enum';

export class CreateCommentLikeDomainDto {
  userId: string;
  commentId: string;
  likeStatus: LikeStatus;
}
