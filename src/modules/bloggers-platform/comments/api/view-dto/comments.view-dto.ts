import { LikeStatus } from '../../../common/types/like-status.enum';
import { CommentWithUserLoginAndLikesInfo } from '../../infrastructure/types/comment-db.types';

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;

  static mapToView = (
    comment: CommentWithUserLoginAndLikesInfo,
  ): CommentViewDto => {
    const viewDto = new CommentViewDto();

    viewDto.id = comment.id.toString();
    viewDto.content = comment.content;
    viewDto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };
    viewDto.createdAt = comment.createdAt;
    viewDto.likesInfo = {
      likesCount: Number(comment.likesCount),
      dislikesCount: Number(comment.dislikesCount),
      myStatus: comment.myStatus,
    };

    return viewDto;
  };
}
