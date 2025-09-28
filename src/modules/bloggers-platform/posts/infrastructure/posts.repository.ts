import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PostDbModel } from './types/post-db.types';
import { Post } from '../entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
  ) {}

  async findById(id: number): Promise<Post | null> {
    return this.postsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findPostById(id: number): Promise<PostDbModel | null> {
    const result = await this.dataSource.query<PostDbModel[]>(
      `SELECT * FROM "Posts" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async save(post: Post): Promise<void> {
    await this.postsRepo.save(post);
  }
}
