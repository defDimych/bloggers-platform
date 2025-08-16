import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteBlogCommand {
  constructor(public id: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ id }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlogById(id);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${id} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    await this.blogsRepository.makeDeleted(blog.id);
  }
}
