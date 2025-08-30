import { LikeStatus } from '../../../common/types/like-status.enum';

export type PostLikeDbModel = {
  id: number;
  userId: number;
  postId: number;
  status: LikeStatus;
  createdAt: string;
};
