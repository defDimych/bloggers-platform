import { CreateBlogDto } from '../../dto/create-blog.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../entities/blog.entity';

export class CreateBlogCommand extends Command<number> {
  constructor(public dto: CreateBlogDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private blogsRepository: BlogsRepository) {}
  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = Blog.create(dto);

    await this.blogsRepository.save(blog);

    return blog.id;
  }
}
