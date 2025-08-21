import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({ _id: id, deletedAt: null });
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

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
