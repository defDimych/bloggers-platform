import { CommentDocument } from '../../domain/comment.entity';
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

  static mapManyToView(dto: {
    userId: string | null;
    comments: CommentDocument[];
    dictionaryLikes: Map<string, LikeStatus>;
  }): CommentViewDto[] {
    const items: CommentViewDto[] = dto.comments.map((comment) => {
      const likeStatus: LikeStatus | undefined = dto.dictionaryLikes.get(
        comment._id.toString(),
      );

      return {
        id: comment._id.toString(),
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.login,
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        likesInfo: {
          likesCount: comment.likesCount,
          dislikesCount: comment.dislikesCount,
          myStatus: !dto.userId || !likeStatus ? LikeStatus.None : likeStatus,
        },
      };
    });

    return items;
  }

  static mapToView(comment: CommentWithUserLoginAndLikesInfo): CommentViewDto {
    const viewDto = new CommentViewDto();

    viewDto.id = comment.id.toString();
    viewDto.content = comment.content;
    viewDto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };
    viewDto.createdAt = comment.createdAt;
    viewDto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus: comment.myStatus,
    };

    return viewDto;
  }
}
