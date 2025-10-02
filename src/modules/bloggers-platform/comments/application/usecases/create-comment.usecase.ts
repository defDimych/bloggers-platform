import { CreateCommentDto } from '../dto/create-comment.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Comment } from '../../entities/comment.entity';

export class CreateCommentCommand extends Command<number> {
  constructor(public dto: CreateCommentDto) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, number>
{
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}
  async execute({ dto }: CreateCommentCommand): Promise<number> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: 'post not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    const comment = Comment.create({
      userId: Number(dto.userId),
      postId: post.id,
      content: dto.content,
    });

    await this.commentsRepository.save(comment);

    return comment.id;
  }
}
