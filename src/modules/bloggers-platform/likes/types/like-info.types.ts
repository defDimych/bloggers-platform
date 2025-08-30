type LikeInfo = {
  userId: string;
  login: string;
  addedAt: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeInfo[];
};
