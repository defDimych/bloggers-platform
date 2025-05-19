import { CreateBlogDto } from '../../dto/create-blog.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand extends Command<string> {
  constructor(public dto: CreateBlogDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const blog: BlogDocument = this.BlogModel.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }
}
