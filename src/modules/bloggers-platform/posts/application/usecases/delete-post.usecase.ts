import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class DeletePostCommand {
  constructor(
    public postId: number,
    public blogId: number,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ blogId, postId }: DeletePostCommand): Promise<void> {
    const blog = await this.blogsRepository.findById(blogId);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${blogId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const post = await this.postsRepository.findById(postId);

    if (!post) {
      throw new DomainException({
        message: `Post by id:${postId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    post.makeDeleted();

    await this.postsRepository.save(post);
  }
}
