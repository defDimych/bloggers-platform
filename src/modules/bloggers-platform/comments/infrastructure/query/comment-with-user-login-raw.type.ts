export type CommentWithUserLoginRaw = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userLogin: string;
};
