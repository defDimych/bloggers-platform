import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CommentDbModel } from './types/comment-db.types';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  async findById(id: number): Promise<Comment | null> {
    return this.commentsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

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

  async save(comment: Comment): Promise<void> {
    await this.commentsRepo.save(comment);
  }
}
