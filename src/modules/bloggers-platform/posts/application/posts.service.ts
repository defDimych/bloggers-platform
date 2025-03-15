import { CreatePostDto } from '../dto/create-post.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infrastructure/posts.repository';

enum ErrorType {
  ERROR = 'error',
  NOT_FOUND = 'notFound',
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  private async createPostInternal(
    dto: CreatePostDto,
    errorType: ErrorType,
  ): Promise<string> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      if (errorType === ErrorType.ERROR) {
        throw new Error('Blog not found');
      } else {
        throw new NotFoundException('Blog not found');
      }
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
  async createPost(dto: CreatePostDto): Promise<string> {
    return this.createPostInternal(dto, ErrorType.ERROR);
  }

  async createPostForBlog(dto: CreatePostDto): Promise<string> {
    return this.createPostInternal(dto, ErrorType.NOT_FOUND);
  }
}
