import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeDbModel } from './types/post-like-db-model.type';
import { LikeStatus } from '../../common/types/like-status.enum';

@Injectable()
export class PostLikeRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostLike(dto: {
    postId: number;
    userId: number;
  }): Promise<PostLikeDbModel | null> {
    const result = await this.dataSource.query<PostLikeDbModel[]>(
      `
      SELECT *
      FROM "PostsLikes"
      WHERE "postId" = $1
        AND "userId" = $2;`,
      [dto.postId, dto.userId],
    );

    return result.length === 1 ? result[0] : null;
  }

  async createPostLike(dto: {
    postId: number;
    userId: number;
    likeStatus: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO "PostsLikes" ("postId", "userId", status)
      VALUES ($1, $2, $3)`,
      [dto.postId, dto.userId, dto.likeStatus],
    );
  }

  async updatePostLikeStatus(dto: {
    likeId: number;
    likeStatus: LikeStatus;
  }): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "PostsLikes"
      SET status = $1
      WHERE id = $2`,
      [dto.likeStatus, dto.likeId],
    );
  }
}
