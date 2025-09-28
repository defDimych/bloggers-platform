import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Post } from '../../entities/post.entity';

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
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${dto.blogId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const post = Post.create({
      blogId: blog.id,
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
    });

    await this.postsRepository.save(post);

    return post.id;
  }
}
