type LikeInfoDb = {
  userId: number;
  login: string;
  addedAt: string;
};

export type ExtendedLikesInfoDb = {
  likesCount: string;
  dislikesCount: string;
  myStatus: string;
  newestLikes: LikeInfoDb[] | null;
};
