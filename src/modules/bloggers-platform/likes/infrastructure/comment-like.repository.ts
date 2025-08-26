import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLikeDbModel } from './types/comment-like-db-model.type';
import { LikeStatus } from '../../common/types/like-status.enum';

@Injectable()
export class CommentLikeRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentLike(dto: {
    commentId: number;
    userId: number;
  }): Promise<CommentLikeDbModel | null> {
    const result = await this.dataSource.query<CommentLikeDbModel[]>(
      `
      SELECT *
      FROM "CommentsLikes"
      WHERE "commentId" = $1
        AND "userId" = $2`,
      [dto.commentId, dto.userId],
    );

    return result.length === 1 ? result[0] : null;
  }

  async createCommentLike(dto: {
    commentId: number;
    userId: number;
    likeStatus: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO "CommentsLikes" ("commentId", "userId", status)
      VALUES ($1, $2, $3)`,
      [dto.commentId, dto.userId, dto.likeStatus],
    );
  }

  async updateCommentLikeStatus(dto: {
    likeId: number;
    likeStatus: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "CommentsLikes"
      SET status = $1
      WHERE id = $2`,
      [dto.likeStatus, dto.likeId],
    );
  }
}
