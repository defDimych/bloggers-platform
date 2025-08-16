import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand extends Command<number> {
  constructor(public dto: CreatePostDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, number>
{
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}
  async execute({ dto }: CreatePostCommand): Promise<number> {
    const blog = await this.blogsRepository.findBlogById(dto.blogId);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.postsRepository.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });
  }
}
