import { LikeStatus } from '../../../common/types/like-status.enum';
import { PostWithBlogNameRaw } from '../../infrastructure/query/post-with-blog-name-raw.type';

type LikeInfo = {
  userId: string;
  login: string;
  addedAt: string;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: LikeInfo[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView = (raw: PostWithBlogNameRaw): PostViewDto => {
    const viewDto = new PostViewDto();

    viewDto.id = raw.id.toString();
    viewDto.title = raw.title;
    viewDto.shortDescription = raw.shortDescription;
    viewDto.content = raw.content;
    viewDto.blogId = raw.blogId.toString();
    viewDto.blogName = raw.blogName;
    viewDto.createdAt = raw.createdAt.toISOString();
    viewDto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: LikeStatus.None,
      newestLikes: [],
    };

    return viewDto;
  };

  // Example of mapping raw SQL result to PostViewDto with extended likes info
  //
  // static mapToView = (
  //   post: PostWithBlogNameAndExtendedLikesInfo,
  // ): PostViewDto => {
  //   const viewDto = new PostViewDto();
  //
  //   viewDto.id = post.id.toString();
  //   viewDto.title = post.title;
  //   viewDto.shortDescription = post.shortDescription;
  //   viewDto.content = post.content;
  //   viewDto.blogId = post.blogId.toString();
  //   viewDto.blogName = post.blogName;
  //   viewDto.createdAt = post.createdAt;
  //   viewDto.extendedLikesInfo = {
  //     likesCount: Number(post.likesCount),
  //     dislikesCount: Number(post.dislikesCount),
  //     myStatus: post.myStatus,
  //     // необходима проверка на null, т.к при создании поста, и likesCount: 0 возвращается пустой массив!
  //     newestLikes: post.newestLikes
  //       ? post.newestLikes.map((l) => {
  //           return {
  //             addedAt: l.addedAt,
  //             userId: l.userId.toString(),
  //             login: l.login,
  //           };
  //         })
  //       : [],
  //   };
  //
  //   return viewDto;
  // };
}
