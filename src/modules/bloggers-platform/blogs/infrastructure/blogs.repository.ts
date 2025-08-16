import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDbModel } from './types/blog-db-model.type';
import { UpdateBlogRepoDto } from './dto/update-blog.repo-dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogById(id: number): Promise<BlogDbModel | null> {
    const result = await this.dataSource.query<BlogDbModel[]>(
      `SELECT * FROM "Blogs" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async createBlog(dto: {
    name: string;
    description: string;
    websiteUrl: string;
  }): Promise<number> {
    const result = await this.dataSource.query<{ id: number }[]>(
      `INSERT INTO "Blogs" (name, description, "websiteUrl") VALUES ($1, $2, $3) RETURNING id;`,
      [dto.name, dto.description, dto.websiteUrl],
    );

    return result[0].id;
  }

  async updateBlog(dto: UpdateBlogRepoDto): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Blogs" SET (name, description, "websiteUrl") = ($1, $2, $3)
WHERE id = $4 
AND "deletedAt" IS NULL`,
      [dto.name, dto.description, dto.websiteUrl, dto.id],
    );
  }

  async makeDeleted(id: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Blogs" SET "deletedAt" = now() WHERE id = $1`,
      [id],
    );
  }
}
