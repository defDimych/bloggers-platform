import { LikeStatus } from '../../../common/types/like-status.enum';

export type CommentDbModel = {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  deletedAt: string;
};

type LikesInfoDb = {
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatus;
};

export type CommentWithUserLoginAndLikesInfo = CommentDbModel & {
  userLogin: string;
} & LikesInfoDb;
