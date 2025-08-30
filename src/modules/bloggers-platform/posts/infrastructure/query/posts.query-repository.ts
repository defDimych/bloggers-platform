import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { getPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { LikeStatus } from '../../../common/types/like-status.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  PostWithBlogName,
  PostWithBlogNameAndExtendedLikesInfo,
} from '../types/post-db.types';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllPostsWithDefaultLikesInfo(dto: {
    queryParams: getPostsQueryParams;
    userId: number | null;
    blogId?: number;
  }): Promise<PaginatedViewDto<PostViewDto[]>> {
    let filter = `p."deletedAt" IS NULL`;
    let params: number[] | [] = [];

    if (dto.blogId) {
      filter = `p."blogId" = $1 AND p."deletedAt" IS NULL`;
      params = [dto.blogId];
    }

    try {
      const posts = await this.dataSource.query<PostWithBlogName[]>(
        `
  SELECT
    p.*,
    b."name" AS "blogName"
  FROM "Posts" p
    LEFT JOIN "Blogs" b ON p."blogId" = b.id
  WHERE ${filter}
  ORDER BY "${dto.queryParams.sortBy}" ${dto.queryParams.sortDirection}
  LIMIT ${dto.queryParams.pageSize}
  OFFSET ${dto.queryParams.calculateSkip()}
  `,
        params,
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `SELECT
COUNT(*) FILTER (WHERE ${filter}) AS "totalCount"
FROM "Posts" p;`,
        params,
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

  async findPostByIdOrNotFoundFail(
    postId: number,
    userId?: number | null,
  ): Promise<PostViewDto> {
    const result = await this.dataSource.query<
      PostWithBlogNameAndExtendedLikesInfo[]
    >(
      `
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
    FROM (
      SELECT
        pl.*,
        u.login,
        ROW_NUMBER() OVER (ORDER BY pl."createdAt" DESC) AS "rowNumber"
      FROM "PostsLikes" pl
        LEFT JOIN "Users" u ON pl."userId" = u.id
    ) AS "NumberedPostsLikes"
    WHERE "rowNumber" BETWEEN 1 AND 3
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
}
