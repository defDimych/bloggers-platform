import { CreatePostDto } from '../dto/create-post.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);

    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.update(dto);

    await this.postsRepository.save(post);
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
