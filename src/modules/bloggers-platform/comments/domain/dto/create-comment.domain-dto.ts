type CommentatorInfo = {
  userId: string;
  login: string;
};

export class CreateCommentDomainDto {
  postId: string;
  content: string;
  commentatorInfo: CommentatorInfo;
}
