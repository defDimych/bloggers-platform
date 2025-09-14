import { CommentDocument } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentDbModel } from './types/comment-db.types';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentById(id: number): Promise<CommentDbModel | null> {
    const result = await this.dataSource.query<CommentDbModel[]>(
      `
  SELECT *
  FROM "Comments"
  WHERE id = $1
    AND "deletedAt" IS NULL;
  `,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async createComment(dto: {
    userId: number;
    postId: number;
    content: string;
  }): Promise<number> {
    const result = await this.dataSource.query<{ id: number }[]>(
      `
  INSERT INTO "Comments" ("userId", "postId", content)
  VALUES ($1, $2, $3)
  RETURNING id
  `,
      [dto.userId, dto.postId, dto.content],
    );

    return result[0].id;
  }

  async updateComment(id: number, content: string): Promise<void> {
    await this.dataSource.query(
      `
  UPDATE "Comments"
  SET content = $1
  WHERE id = $2
    AND "deletedAt" IS NULL;
  `,
      [content, id],
    );
  }

  async makeDeleted(id: number): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "Comments"
      SET "deletedAt" = NOW()
      WHERE id = $1;`,
      [id],
    );
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
