import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CommentLike } from '../entities/comment-like.entity';

@Injectable()
export class CommentsLikesRepository {
  constructor(
    @InjectRepository(CommentLike)
    private readonly commentsLikesRepo: Repository<CommentLike>,
  ) {}

  async findLike(dto: {
    commentId: number;
    userId: number;
  }): Promise<CommentLike | null> {
    return this.commentsLikesRepo.findOne({
      where: {
        commentId: dto.commentId,
        userId: dto.userId,
        deletedAt: IsNull(),
      },
    });
  }

  async save(commentLike: CommentLike): Promise<void> {
    await this.commentsLikesRepo.save(commentLike);
  }
}
