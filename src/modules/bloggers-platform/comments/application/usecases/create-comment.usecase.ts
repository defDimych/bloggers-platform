import { CreateCommentDto } from '../dto/create-comment.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UsersRepository } from '../../../../user-accounts/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class CreateCommentCommand extends Command<string> {
  constructor(public dto: CreateCommentDto) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
  ) {}
  async execute({ dto }: CreateCommentCommand): Promise<string> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: 'post not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    const user = await this.usersRepository.findByIdOrNotFoundFail(dto.userId);

    const comment = this.CommentModel.createInstance({
      postId: dto.postId,
      content: dto.content,
      commentatorInfo: {
        userId: dto.userId,
        login: user.accountData.login,
      },
    });

    await this.commentsRepository.save(comment);

    return comment._id.toString();
  }
}
