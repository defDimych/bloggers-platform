export type CommentDbModel = {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  deletedAt: string;
};

export type CommentWithUserLogin = CommentDbModel & { userLogin: string };
