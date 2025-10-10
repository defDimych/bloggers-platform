import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
  ) {}

  async findById(id: number): Promise<Comment | null> {
    return this.commentsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async save(comment: Comment): Promise<void> {
    await this.commentsRepo.save(comment);
  }
}
