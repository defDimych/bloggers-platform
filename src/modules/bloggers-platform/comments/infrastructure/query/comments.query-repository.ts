import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { CommentWithUserLoginWithLikesInfoRaw } from './comment-with-user-login-with-likes-info-raw.type';
import { GetCommentsQueryParams } from '../../../posts/api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentLike } from '../../../likes/entities/comment-like.entity';
import { LikeStatus } from '../../../common/types/like-status.enum';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private buildLikesCountSubquery() {
    return (sq: SelectQueryBuilder<CommentLike>) => {
      return sq
        .select('COUNT(*) ::int')
        .from(CommentLike, 'cl')
        .where('cl."commentId" = c.id')
        .andWhere(`cl.status = '${LikeStatus.Like}'`);
    };
  }

  private buildDislikesCountSubquery() {
    return (sq: SelectQueryBuilder<CommentLike>) => {
      return sq
        .select('COUNT(*) ::int')
        .from(CommentLike, 'cl')
        .where('cl."commentId" = c.id')
        .andWhere(`cl.status = '${LikeStatus.Dislike}'`);
    };
  }

  private buildMyStatusSubquery(userId: number) {
    return (sq: SelectQueryBuilder<CommentLike>) => {
      return sq
        .select('cl.status')
        .from(CommentLike, 'cl')
        .where('cl."commentId" = c.id')
        .andWhere('cl."userId" = :userId', { userId });
    };
  }

  async findCommentByIdOrNotFoundFail(dto: {
    commentId: number;
    userId: number | null;
  }): Promise<CommentViewDto> {
    const builder = this.dataSource
      .getRepository(Comment)
      .createQueryBuilder('c')
      .select([
        'c.id as id',
        'c."postId" as "postId"',
        'c."userId" as "userId"',
        'c.content as content',
        'c."createdAt" as "createdAt"',
        'c."updatedAt" as "updatedAt"',
        'c."deletedAt" as "deletedAt"',
        'u.login as "userLogin"',
      ])
      .addSelect(this.buildLikesCountSubquery(), 'likesCount')
      .addSelect(this.buildDislikesCountSubquery(), 'dislikesCount');

    if (dto.userId) {
      builder.addSelect(this.buildMyStatusSubquery(dto.userId), 'myStatus');
    }

    builder
      .leftJoin('c.user', 'u')
      .where('c.id = :commentId AND c."deletedAt" IS NULL', {
        commentId: dto.commentId,
      });

    const comment =
      await builder.getRawOne<CommentWithUserLoginWithLikesInfoRaw>();

    if (!comment) {
      throw new DomainException({
        message: `Comment by id:${dto.commentId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return CommentViewDto.mapToViewWithDefaultLikesInfo(comment);
  }

  async findAllCommentsForPost(dto: {
    queryParams: GetCommentsQueryParams;
    userId: number | null;
    postId: number;
  }): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter = 'c."postId" = :postId AND c."deletedAt" IS NULL';
    const param = { postId: dto.postId };

    try {
      const builder = this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        .select([
          'c.id as id',
          'c."postId" as "postId"',
          'c."userId" as "userId"',
          'c.content as content',
          'c."createdAt" as "createdAt"',
          'c."updatedAt" as "updatedAt"',
          'c."deletedAt" as "deletedAt"',
          'u.login as "userLogin"',
        ])
        .addSelect(this.buildLikesCountSubquery(), 'likesCount')
        .addSelect(this.buildDislikesCountSubquery(), 'dislikesCount');

      if (dto.userId) {
        builder.addSelect(this.buildMyStatusSubquery(dto.userId), 'myStatus');
      }

      builder
        .leftJoin('c.user', 'u')
        .where(filter, param)
        .orderBy(
          `"${dto.queryParams.sortBy}"`,
          `${dto.queryParams.sortDirection}`,
        )
        .limit(dto.queryParams.pageSize)
        .offset(dto.queryParams.calculateSkip());

      const rawCommentsPromise =
        builder.getRawMany<CommentWithUserLoginWithLikesInfoRaw>();

      const totalCountPromise: Promise<number> = this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        .where(filter, param)
        .getCount();

      const [rawComments, totalCount] = await Promise.all([
        rawCommentsPromise,
        totalCountPromise,
      ]);

      const items = rawComments.map(
        CommentViewDto.mapToViewWithDefaultLikesInfo,
      );

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: dto.queryParams.pageNumber,
        size: dto.queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `Comment query repository, findAllCommentsForPost : ${JSON.stringify(e, null, 2)}`,
      );

      throw new Error(`some error`);
    }
  }

  /* Example: raw SQL query to fetch all comments for post with userLogin and likes info.
Supports pagination and sorting.

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
 */

  // Example: raw SQL query to fetch comment with userLogin and likes info.
  //
  // async getCommentByIdOrNotFoundFail(dto: {
  //   commentId: number;
  //   userId: number | null;
  // }): Promise<CommentViewDto> {
  //   const result = await this.dataSource.query<
  //     CommentWithUserLoginAndLikesInfo[]
  //   >(
  //     `
  // SELECT
  //   c.*,
  //   u.login AS "userLogin",
  //   (
  //     SELECT COUNT(*)
  //     FROM "CommentsLikes" cl
  //     WHERE cl."commentId" = c.id
  //       AND cl.status = 'Like'
  //   ) AS "likesCount",
  //   (
  //     SELECT COUNT(*)
  //     FROM "CommentsLikes" cl
  //     WHERE cl."commentId" = c.id
  //       AND cl.status = 'Dislike'
  //   ) AS "dislikesCount",
  //   COALESCE((
  //     SELECT cl.status
  //     FROM "CommentsLikes" cl
  //     WHERE cl."commentId" = c.id
  //       AND cl."userId" = $1
  //   ), '${LikeStatus.None}') AS "myStatus"
  // FROM "Comments" c
  //   LEFT JOIN "Users" u ON c."userId" = u.id
  // WHERE c.id = $2
  //   AND c."deletedAt" IS NULL;
  // `,
  //     [dto.userId, dto.commentId],
  //   );
  //
  //   if (!result.length) {
  //     throw new DomainException({
  //       message: `Comment by id:${dto.commentId} not found!`,
  //       code: DomainExceptionCode.NotFound,
  //     });
  //   }
  //
  //   return CommentViewDto.mapToView(result[0]);
  // }
}
