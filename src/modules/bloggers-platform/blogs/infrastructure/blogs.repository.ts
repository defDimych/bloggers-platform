import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { BlogDbModel } from './types/blog-db-model.type';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private readonly blogsRepo: Repository<Blog>,
  ) {}

  async findBlogById(id: number): Promise<BlogDbModel | null> {
    const result = await this.dataSource.query<BlogDbModel[]>(
      `SELECT * FROM "Blogs" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findById(id: number): Promise<Blog | null> {
    return this.blogsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async save(blog: Blog): Promise<void> {
    await this.blogsRepo.save(blog);
  }
}
