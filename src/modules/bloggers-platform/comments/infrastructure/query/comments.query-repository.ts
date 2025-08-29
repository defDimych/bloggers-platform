import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { LikeStatus } from '../../../common/types/like-status.enum';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentWithUserLoginAndLikesInfo } from '../types/comment-db.types';
import { GetCommentsQueryParams } from '../../../posts/api/input-dto/get-comments-query-params.input-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllCommentsForPost(dto: {
    queryParams: GetCommentsQueryParams;
    userId: number | null;
    postId: number;
  }): Promise<PaginatedViewDto<CommentViewDto[]>> {
    try {
      const comments = await this.dataSource.query<
        CommentWithUserLoginAndLikesInfo[]
      >(
        `
SELECT
    c.*,
    u.login AS "userLogin",
    (
      SELECT COUNT(*)
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl.status = '${LikeStatus.Like}'
    ) AS "likesCount",
    (
      SELECT COUNT(*)
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl.status = '${LikeStatus.Dislike}'
    ) AS "dislikesCount",
    COALESCE((
      SELECT cl.status
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl."userId" = $1
    ), '${LikeStatus.None}') AS "myStatus"
  FROM "Comments" c
    LEFT JOIN "Users" u ON c."userId" = u.id
  WHERE c."postId" = $2
    AND c."deletedAt" IS NULL
  ORDER BY c."${dto.queryParams.sortBy}" ${dto.queryParams.sortDirection}
  LIMIT ${dto.queryParams.pageSize}
  OFFSET ${dto.queryParams.calculateSkip()};
  `,
        [dto.userId, dto.postId],
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `
        SELECT COUNT(*) AS "totalCount"
        FROM "Comments"
        WHERE "postId" = $1
         AND "deletedAt" IS NULL;`,
        [dto.postId],
      );

      const items = comments.map(CommentViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCount[0].totalCount),
        page: dto.queryParams.pageNumber,
        size: dto.queryParams.pageSize,
      });
    } catch (err) {
      console.log(
        `Comment query repository, getAllCommentsForPost : ${JSON.stringify(err, null, 2)}`,
      );

      throw new Error(`some error`);
    }
  }

  async getCommentByIdOrNotFoundFail(dto: {
    commentId: number;
    userId: number | null;
  }): Promise<CommentViewDto> {
    const result = await this.dataSource.query<
      CommentWithUserLoginAndLikesInfo[]
    >(
      `
  SELECT
    c.*,
    u.login AS "userLogin",
    (
      SELECT COUNT(*)
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl.status = 'Like'
    ) AS "likesCount",
    (
      SELECT COUNT(*)
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl.status = 'Dislike'
    ) AS "dislikesCount",
    COALESCE((
      SELECT cl.status
      FROM "CommentsLikes" cl
      WHERE cl."commentId" = c.id
        AND cl."userId" = $1
    ), '${LikeStatus.None}') AS "myStatus"
  FROM "Comments" c
    LEFT JOIN "Users" u ON c."userId" = u.id
  WHERE c.id = $2
    AND c."deletedAt" IS NULL;
  `,
      [dto.userId, dto.commentId],
    );

    if (!result.length) {
      throw new DomainException({
        message: `Comment by id:${dto.commentId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return CommentViewDto.mapToView(result[0]);
  }
}
