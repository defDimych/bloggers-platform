import { PostWithBlogNameAndExtendedLikesInfo } from '../../infrastructure/types/post-db.types';
import { ExtendedLikesInfo } from '../../../likes/types/like-info.types';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView = (
    post: PostWithBlogNameAndExtendedLikesInfo,
  ): PostViewDto => {
    const viewDto = new PostViewDto();

    viewDto.id = post.id.toString();
    viewDto.title = post.title;
    viewDto.shortDescription = post.shortDescription;
    viewDto.content = post.content;
    viewDto.blogId = post.blogId.toString();
    viewDto.blogName = post.blogName;
    viewDto.createdAt = post.createdAt;
    viewDto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: post.myStatus,
      newestLikes: post.newestLikes,
    };

    return viewDto;
  };
}
