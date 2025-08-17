import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { getPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../../likes/domain/post-like.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikeStatus } from '../../../common/types/like-status.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostDbModel } from '../types/post-db-model.type';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  private async getNewestLikes(postId: string): Promise<PostLikeDocument[]> {
    return this.PostLikeModel.find({ postId, myStatus: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(3);
  }

  async getAllPostsWithDefaultLikesInfo(dto: {
    queryParams: getPostsQueryParams;
    userId: string | null;
    blogId?: number;
  }): Promise<PaginatedViewDto<PostViewDto[]>> {
    let filter = `"deletedAt" IS NULL`;
    let params: number[] | [] = [];

    if (dto.blogId) {
      filter = `"blogId" = $1 AND "deletedAt" IS NULL`;
      params = [dto.blogId];
    }

    try {
      const posts = await this.dataSource.query<PostDbModel[]>(
        `SELECT * FROM "Posts"
WHERE ${filter}
ORDER BY "${dto.queryParams.sortBy}" ${dto.queryParams.sortDirection}
LIMIT ${dto.queryParams.pageSize}
OFFSET ${dto.queryParams.calculateSkip()}`,
        params,
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `SELECT
COUNT(*) FILTER (WHERE ${filter}) AS "totalCount"
FROM "Posts";`,
        params,
      );

      const items = posts.map(PostViewDto.mapToViewWithDefaultLikesInfo);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCount[0].totalCount),
        page: dto.queryParams.pageNumber,
        size: dto.queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, getAllPosts : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async getPosts(
    query: getPostsQueryParams,
    userId: string | null,
    blogId?: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter = blogId ? { blogId, deletedAt: null } : { deletedAt: null };

    try {
      const posts = await this.PostModel.find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean();

      const totalCount = await this.PostModel.countDocuments(filter);

      const ids = posts.map((p) => p._id.toString());

      const userLikes: PostLikeDocument[] = userId
        ? await this.PostLikeModel.find({ postId: { $in: ids }, userId }).lean()
        : [];

      const dictionaryLikes = userLikes.reduce((dict, like) => {
        dict.set(like.postId, like.myStatus);
        return dict;
      }, new Map<string, LikeStatus>());

      const itemsPromise = posts.map(async (p) => {
        const likeStatus = dictionaryLikes.get(p._id.toString());
        const newestLikes = await this.getNewestLikes(p._id.toString());

        return {
          id: p._id.toString(),
          title: p.title,
          shortDescription: p.shortDescription,
          content: p.content,
          blogId: p.blogId,
          blogName: p.blogName,
          createdAt: p.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: p.likesCount,
            dislikesCount: p.dislikesCount,
            myStatus: likeStatus ?? LikeStatus.None,
            newestLikes: newestLikes.map((l) => {
              return {
                addedAt: l.createdAt.toISOString(),
                userId: l.userId,
                login: l.userLogin,
              };
            }),
          },
        };
      });

      const items = await Promise.all(itemsPromise);

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

  async findPostByIdOrNotFoundFail(
    postId: number,
    userId?: string | null,
  ): Promise<PostViewDto> {
    const result = await this.dataSource.query<PostDbModel[]>(
      `SELECT * FROM "Posts" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [postId],
    );

    if (!result.length) {
      throw new DomainException({
        message: `post by id:${postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return PostViewDto.mapToViewWithDefaultLikesInfo(result[0]);
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

    const newestLikes = await this.getNewestLikes(postId);

    return PostViewDto.mapToView({
      post,
      userLike: like,
      newestLikes,
    });
  }
}
