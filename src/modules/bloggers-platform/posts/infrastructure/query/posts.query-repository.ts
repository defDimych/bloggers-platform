import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostWithBlogNameAndExtendedLikesInfoRaw } from './post-with-blog-name-raw.type';
import { LikeStatus } from '../../../common/types/like-status.enum';
import { PostLike } from '../../../likes/entities/post-like.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildLikesCountSubquery() {
    return (sq: SelectQueryBuilder<PostLike>) => {
      return sq
        .select('COUNT(*) ::int')
        .from(PostLike, 'pl')
        .where('pl."postId" = p.id')
        .andWhere(`pl.status = '${LikeStatus.Like}'`);
    };
  }

  private buildDislikesCountSubquery() {
    return (sq: SelectQueryBuilder<PostLike>) => {
      return sq
        .select('COUNT(*) ::int')
        .from(PostLike, 'pl')
        .where('pl."postId" = p.id')
        .andWhere(`pl.status = '${LikeStatus.Dislike}'`);
    };
  }

  private buildMyStatusSubquery(userId: number) {
    return (sq: SelectQueryBuilder<PostLike>) => {
      return sq
        .select('pl.status')
        .from(PostLike, 'pl')
        .where('pl."postId" = p.id')
        .andWhere('pl."userId" = :userId', { userId });
    };
  }

  private buildPostLikesWithRowNumberSubquery() {
    return this.dataSource
      .getRepository(PostLike)
      .createQueryBuilder('pl')
      .select([
        'pl."userId" as "userId"',
        'pl."postId" as "postId"',
        'pl."createdAt" as "createdAt"',
        'pl.status as status',
        'u.login as "userLogin"',
        'ROW_NUMBER() OVER(PARTITION BY pl."postId" ORDER BY pl."createdAt" DESC) AS "rowNumber"',
      ])
      .leftJoin('pl.user', 'u');
  }

  private buildNewestLikesSubquery() {
    return (sq: SelectQueryBuilder<any>) => {
      return sq
        .select(
          `
          jsonb_agg(
            json_build_object(
              'addedAt', "createdAt",
              'userId', "userId",
              'login', "userLogin"
            )
          )
        `,
        )
        .from(
          `(${this.buildPostLikesWithRowNumberSubquery().getQuery()})`,
          'numberedPostLikes',
        )
        .where('"numberedPostLikes"."postId" = p.id')
        .andWhere(`"numberedPostLikes".status = '${LikeStatus.Like}'`)
        .andWhere('"numberedPostLikes"."rowNumber" BETWEEN :from AND :to', {
          from: 1,
          to: 3,
        });
    };
  }

  async findPostByIdOrNotFoundFail(
    postId: number,
    userId?: number | null,
  ): Promise<PostViewDto> {
    const builder = this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .select([
        'p.id as id',
        'p."blogId" as "blogId"',
        'p.title as title',
        'p."shortDescription" as "shortDescription"',
        'p.content as content',
        'p."createdAt" as "createdAt"',
        'p."updatedAt" as "updatedAt"',
        'p."deletedAt" as "deletedAt"',
        'b.name as "blogName"',
      ])
      .addSelect(this.buildLikesCountSubquery(), 'likesCount')
      .addSelect(this.buildDislikesCountSubquery(), 'dislikesCount')
      .addSelect(this.buildNewestLikesSubquery(), 'newestLikes');

    if (userId) {
      builder.addSelect(this.buildMyStatusSubquery(userId), 'myStatus');
    }

    builder
      .leftJoin('p.blog', 'b')
      .where('p.id = :postId', { postId })
      .andWhere('p.deletedAt IS NULL');

    const rawPost =
      await builder.getRawOne<PostWithBlogNameAndExtendedLikesInfoRaw>();

    if (!rawPost) {
      throw new DomainException({
        message: `post by id:${postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return PostViewDto.mapToView(rawPost);
  }

  async getAllPostsWithOptionalBlogId(dto: {
    queryParams: GetPostsQueryParams;
    userId: number | null;
    blogId?: number;
  }): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter = dto.blogId
      ? 'p.blogId = :blogId AND p.deletedAt IS NULL'
      : 'p.deletedAt IS NULL';

    const param = dto.blogId ? { blogId: dto.blogId } : {};

    try {
      const builder = this.dataSource
        .getRepository(Post)
        .createQueryBuilder('p')
        .select([
          'p.id as id',
          'p."blogId" as "blogId"',
          'p.title as title',
          'p."shortDescription" as "shortDescription"',
          'p.content as content',
          'p."createdAt" as "createdAt"',
          'p."updatedAt" as "updatedAt"',
          'p."deletedAt" as "deletedAt"',
          'b.name as "blogName"',
        ])
        .addSelect(this.buildLikesCountSubquery(), 'likesCount')
        .addSelect(this.buildDislikesCountSubquery(), 'dislikesCount')
        .addSelect(this.buildNewestLikesSubquery(), 'newestLikes');

      if (dto.userId) {
        builder.addSelect(this.buildMyStatusSubquery(dto.userId), 'myStatus');
      }

      builder
        .leftJoin('p.blog', 'b')
        .where(filter, param)
        .orderBy(
          `"${dto.queryParams.sortBy}"`,
          `${dto.queryParams.sortDirection}`,
        )
        .limit(dto.queryParams.pageSize)
        .offset(dto.queryParams.calculateSkip());

      const rawPostsPromise =
        builder.getRawMany<PostWithBlogNameAndExtendedLikesInfoRaw>();

      const totalCountPromise: Promise<number> = this.dataSource
        .getRepository(Post)
        .createQueryBuilder('p')
        .where(filter, param)
        .getCount();

      const [rawPosts, totalCount] = await Promise.all([
        rawPostsPromise,
        totalCountPromise,
      ]);

      const items = rawPosts.map(PostViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
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

  /* Example: raw SQL query to fetch all posts with blog name and extended likes info.
  Supports optional blogId filter, pagination, and sorting.

  async getAllPostsWithOptionalBlogId(dto: {
    queryParams: getPostsQueryParams;
    userId: number | null;
    blogId?: number;
  }): Promise<PaginatedViewDto<PostViewDto[]>> {
    // фильтр и параметры для списка постов ($1 — всегда userId, $2 — blogId при наличии)
    const filterPosts = dto.blogId
      ? `p."blogId" = $2 AND p."deletedAt" IS NULL`
      : `p."deletedAt" IS NULL`;

    const paramsPosts: (number | null)[] = [
      dto.userId,
      ...(dto.blogId ? [dto.blogId] : []),
    ];

    // фильтр и параметры для totalCount (тут нужен только blogId как $1 при наличии)
    const filterCount = dto.blogId
      ? `p."blogId" = $1 AND p."deletedAt" IS NULL`
      : `p."deletedAt" IS NULL`;

    const paramsCount: number[] = dto.blogId ? [dto.blogId] : [];
    try {
      const posts = await this.dataSource.query<
        PostWithBlogNameAndExtendedLikesInfo[]
      >(
        `
WITH "NumberedPostsLikes" AS (
    SELECT
        pl.*,
        u.login,
        ROW_NUMBER() OVER (
            PARTITION BY pl."postId"
            ORDER BY pl."createdAt" DESC
        ) AS "rowNumber"
    FROM "PostsLikes" pl
        LEFT JOIN "Users" u ON pl."userId" = u.id
)

SELECT
  p.*,
  b."name" AS "blogName",
  (
    SELECT COUNT(*)
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl.status = '${LikeStatus.Like}'
  ) AS "likesCount",
  (
    SELECT COUNT(*)
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl.status = '${LikeStatus.Dislike}'
  ) AS "dislikesCount",
  COALESCE((
    SELECT pl.status
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl."userId" = $1
  ), '${LikeStatus.None}') AS "myStatus",
  (
    SELECT jsonb_agg(
      json_build_object(
        'addedAt', "createdAt",
        'userId', "userId",
        'login', "login"
      )
    ) AS "newestLikes"
    FROM "NumberedPostsLikes"
    WHERE "postId" = p.id
      AND status = '${LikeStatus.Like}'
      AND "rowNumber" BETWEEN 1 AND 3
  )
FROM "Posts" p
  LEFT JOIN "Blogs" b ON p."blogId" = b.id
WHERE ${filterPosts}
  ORDER BY "${dto.queryParams.sortBy}" ${dto.queryParams.sortDirection}
  LIMIT ${dto.queryParams.pageSize}
  OFFSET ${dto.queryParams.calculateSkip()}
  `,
        paramsPosts,
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `SELECT
COUNT(*) FILTER (WHERE ${filterCount}) AS "totalCount"
FROM "Posts" p;`,
        paramsCount,
      );

      const items = posts.map(PostViewDto.mapToView);

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
   */

  /*
  Example: raw SQL query to fetch post with blog name and extended likes info.

  async findPostByIdOrNotFoundFail(
    postId: number,
    userId?: number | null,
  ): Promise<PostViewDto> {
    const result = await this.dataSource.query<
      PostWithBlogNameAndExtendedLikesInfo[]
    >(
      `
WITH "NumberedPostsLikes" AS (
    SELECT
        pl.*,
        u.login,
        ROW_NUMBER() OVER (
            PARTITION BY pl."postId"
            ORDER BY pl."createdAt" DESC
        ) AS "rowNumber"
    FROM "PostsLikes" pl
        LEFT JOIN "Users" u ON pl."userId" = u.id
)

SELECT
  p.*,
  b."name" AS "blogName",
  (
    SELECT COUNT(*)
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl.status = '${LikeStatus.Like}'
  ) AS "likesCount",
  (
    SELECT COUNT(*)
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl.status = '${LikeStatus.Dislike}'
  ) AS "dislikesCount",
  COALESCE((
    SELECT pl.status
    FROM "PostsLikes" pl
    WHERE pl."postId" = p.id
      AND pl."userId" = $1
  ), '${LikeStatus.None}') AS "myStatus",
  (
    SELECT jsonb_agg(
      json_build_object(
        'addedAt', "createdAt",
        'userId', "userId",
        'login', "login"
      )
    ) AS "newestLikes"
    FROM "NumberedPostsLikes"
    WHERE "postId" = $2
      AND status = '${LikeStatus.Like}'
      AND "rowNumber" BETWEEN 1 AND 3
  )
FROM "Posts" p
  LEFT JOIN "Blogs" b ON p."blogId" = b.id
WHERE p.id = $2
  AND p."deletedAt" IS NULL;
  `,
      [userId, postId],
    );

    if (!result.length) {
      throw new DomainException({
        message: `post by id:${postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return PostViewDto.mapToView(result[0]);
  }
   */
}
