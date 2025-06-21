import { PostDocument } from '../../domain/post.entity';
import { PostLikeDocument } from '../../../likes/domain/post-like.entity';
import { LikeStatus } from '../../../common/types/like-status.enum';

type LikeInfoType = {
  userId: string;
  login: string;
  addedAt: string;
};

type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeInfoType[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoType;

  static mapToView = (dto: {
    post: PostDocument;
    userLike: PostLikeDocument | null;
    newestLikes: PostLikeDocument[];
  }): PostViewDto => {
    const viewDto = new PostViewDto();

    viewDto.id = dto.post._id.toString();
    viewDto.title = dto.post.title;
    viewDto.shortDescription = dto.post.shortDescription;
    viewDto.content = dto.post.content;
    viewDto.blogId = dto.post.blogId;
    viewDto.blogName = dto.post.blogName;
    viewDto.createdAt = dto.post.createdAt.toISOString();
    viewDto.extendedLikesInfo = {
      likesCount: dto.post.likesCount,
      dislikesCount: dto.post.dislikesCount,
      myStatus: dto.userLike ? dto.userLike.myStatus : LikeStatus.None,
      newestLikes: dto.newestLikes.map((l) => {
        return {
          addedAt: l.createdAt.toISOString(),
          userId: l.userId,
          login: l.userLogin,
        };
      }),
    };

    return viewDto;
  };
}
