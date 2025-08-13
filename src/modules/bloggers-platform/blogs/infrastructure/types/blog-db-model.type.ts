export type BlogDbModel = {
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
  deletedAt: string | null;
};
