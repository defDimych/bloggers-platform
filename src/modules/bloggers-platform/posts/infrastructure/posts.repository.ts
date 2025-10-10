import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
  ) {}

  async findById(id: number): Promise<Post | null> {
    return this.postsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async save(post: Post): Promise<void> {
    await this.postsRepo.save(post);
  }
}
