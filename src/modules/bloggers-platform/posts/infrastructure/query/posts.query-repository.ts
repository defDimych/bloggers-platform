import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { getPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import {
  PostLike,
  PostLikeModelType,
} from '../../../likes/domain/post-like.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikeStatus } from '../../../common/types/like-status.enum';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async getPosts(
    query: getPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter = blogId ? { blogId, deletedAt: null } : { deletedAt: null };

    try {
      const posts = await this.PostModel.find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean();

      const totalCount = await this.PostModel.countDocuments(filter);

      // @ts-ignore
      const items = posts.map(PostViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    } catch (error) {
      console.log(
        `POST query repository, getPosts : ${JSON.stringify(error, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findByIdOrNotFoundFail(
    postId: string,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({ _id: postId, deletedAt: null });

    if (!post) {
      throw new DomainException({
        message: `post by id:${postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const like = userId
      ? await this.PostLikeModel.findOne({ postId, userId }).lean()
      : null;

    const newestLikes = await this.PostLikeModel.find({
      postId,
      myStatus: LikeStatus.Like,
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return PostViewDto.mapToView({
      post,
      userLike: like,
      newestLikes,
    });
  }
}
