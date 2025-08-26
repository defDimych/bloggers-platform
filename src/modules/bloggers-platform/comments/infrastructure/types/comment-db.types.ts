import { LikeStatus } from '../../../common/types/like-status.enum';

export type CommentDbModel = {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  deletedAt: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type CommentWithUserLoginAndLikesInfo = CommentDbModel & {
  userLogin: string;
} & LikesInfo;
