import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { NotFoundException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto, id }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
