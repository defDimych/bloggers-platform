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
