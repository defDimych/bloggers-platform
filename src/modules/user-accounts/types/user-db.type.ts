export type UserDbType = {
  id: number;
  login: string;
  email: string;
  passwordHash: string;
  deletedAt: string | null;
  createdAt: string;
};
