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
    const blog = await this.blogsRepository.findBlogById(dto.blogId);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${dto.blogId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const post = await this.postsRepository.findPostById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: `Post by id:${dto.postId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    await this.postsRepository.updatePost({
      postId: post.id,
      blogId: blog.id,
      content: dto.content,
      title: dto.title,
      shortDescription: dto.shortDescription,
    });
  }
}
