import { ExtendedLikesInfo } from '../../../likes/types/like-info.types';

export type PostDbModel = {
  id: number;
  blogId: number;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
  deletedAt: string;
};

export type PostWithBlogName = PostDbModel & { blogName: string };
export type PostWithBlogNameAndExtendedLikesInfo = PostDbModel & {
  blogName: string;
} & ExtendedLikesInfo;
