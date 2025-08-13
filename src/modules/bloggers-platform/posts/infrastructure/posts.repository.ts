import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostRepoDto } from './dto/create-post.repo-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostDbModel } from './types/post-db-model.type';
import { UpdatePostRepoDto } from './dto/update-post.repo-dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async findPostById(id: number): Promise<PostDbModel | null> {
    const result = await this.dataSource.query<PostDbModel[]>(
      `SELECT * FROM "Posts" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [id],
    );

    return result.length === 1 ? result[0] : null;
  }

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async createPost(dto: CreatePostRepoDto): Promise<number> {
    const result = await this.dataSource.query<{ id: number }[]>(
      `INSERT INTO "Posts" ("blogId", "blogName", title, "shortDescription", content) 
VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [dto.blogId, dto.blogName, dto.title, dto.shortDescription, dto.content],
    );

    return result[0].id;
  }

  async updatePost(dto: UpdatePostRepoDto): Promise<void> {
    await this.dataSource.query(
      `UPDATE "Posts" SET ("blogId", content, "shortDescription", title) = ($1, $2, $3, $4)
WHERE id = $5 
AND "deletedAt" IS NULL`,
      [dto.blogId, dto.content, dto.shortDescription, dto.title, dto.postId],
    );
  }

  async save(post: PostDocument) {
    await post.save();
  }
}
