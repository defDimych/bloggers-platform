import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePostCommand {
  constructor(public dto: UpdatePostDto) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ dto }: UpdatePostCommand): Promise<void> {
    const blog = await this.blogsRepository.findById(dto.blogId);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${dto.blogId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: `Post by id:${dto.postId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
    });

    await this.postsRepository.save(post);
  }
}
