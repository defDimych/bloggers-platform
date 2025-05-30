import { CommentDocument } from '../../domain/comment.entity';

export enum Status {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: Status;
};

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;

  static mapToView = (comment: CommentDocument): CommentViewDto => {
    const dto = new CommentViewDto();

    dto.id = comment._id.toString();
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.login,
    };
    dto.content = comment.content;
    dto.createdAt = comment.createdAt.toISOString();
    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      // TODO: заглушка
      myStatus: Status.None,
    };

    return dto;
  };
}
