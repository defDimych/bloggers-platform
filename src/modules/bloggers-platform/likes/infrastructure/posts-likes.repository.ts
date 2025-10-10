import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PostLike } from '../entities/post-like.entity';

@Injectable()
export class PostsLikesRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly postsLikesRepo: Repository<PostLike>,
  ) {}

  async findLike(dto: {
    postId: number;
    userId: number;
  }): Promise<PostLike | null> {
    return this.postsLikesRepo.findOne({
      where: {
        postId: dto.postId,
        userId: dto.userId,
        deletedAt: IsNull(),
      },
    });
  }

  async save(postLike: PostLike): Promise<void> {
    await this.postsLikesRepo.save(postLike);
  }
}
