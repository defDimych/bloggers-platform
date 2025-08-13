import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateBlogCommand {
  constructor(
    public id: number,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findBlogById(id);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${id} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    await this.blogsRepository.updateBlog({
      id: blog.id,
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    });
  }
}
