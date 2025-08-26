import { LikeStatus } from '../../../common/types/like-status.enum';

export type CommentLikeDbModel = {
  id: number;
  userId: number;
  commentId: number;
  status: LikeStatus;
  createdAt: string;
};
