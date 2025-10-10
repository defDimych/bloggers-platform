type LikeInfoDb = {
  userId: number;
  login: string;
  addedAt: string;
};

type ExtendedLikesInfoDb = {
  likesCount: number;
  dislikesCount: number;
  myStatus?: string;
  newestLikes: LikeInfoDb[] | null;
};

export type PostWithBlogNameRaw = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  blogId: number;
  title: string;
  shortDescription: string;
  content: string;
  blogName: string;
};

export type PostWithBlogNameAndExtendedLikesInfoRaw = PostWithBlogNameRaw &
  ExtendedLikesInfoDb;
