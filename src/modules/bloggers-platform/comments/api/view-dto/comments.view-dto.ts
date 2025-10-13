import { LikeStatus } from '../../../common/types/like-status.enum';
import { CommentWithUserLoginWithLikesInfoRaw } from '../../infrastructure/query/comment-with-user-login-with-likes-info-raw.type';

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

  static mapToViewWithDefaultLikesInfo = (
    raw: CommentWithUserLoginWithLikesInfoRaw,
  ) => {
    const viewDto = new CommentViewDto();

    viewDto.id = raw.id.toString();
    viewDto.content = raw.content;
    viewDto.commentatorInfo = {
      userId: raw.userId.toString(),
      userLogin: raw.userLogin,
    };
    viewDto.createdAt = raw.createdAt.toISOString();
    viewDto.likesInfo = {
      likesCount: raw.likesCount,
      dislikesCount: raw.dislikesCount,
      myStatus: raw.myStatus ? raw.myStatus : LikeStatus.None,
    };

    return viewDto;
  };
}
