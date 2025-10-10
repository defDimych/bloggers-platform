import { LikeStatus } from '../../../common/types/like-status.enum';

export type CommentWithUserLoginWithLikesInfoRaw = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userLogin: string;
  likesCount: number;
  dislikesCount: number;
  myStatus?: LikeStatus;
};
