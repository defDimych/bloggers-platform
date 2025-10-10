import { UpdateCommentLikeStatusDto } from './dto/update-comment-like-status.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { CommentsLikesRepository } from '../../../infrastructure/comments-likes.repository';
import { CreateCommentLikeCommand } from './create-comment-like.usecase';

export class UpdateCommentLikeStatusCommand {
  constructor(public dto: UpdateCommentLikeStatusDto) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsLikesRepository: CommentsLikesRepository,
    private commandBus: CommandBus,
  ) {}
  async execute({ dto }: UpdateCommentLikeStatusCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(dto.commentId);

    if (!comment) {
      throw new DomainException({
        message: 'comment not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    const like = await this.commentsLikesRepository.findLike({
      commentId: comment.id,
      userId: Number(dto.userId),
    });

    if (!like) {
      await this.commandBus.execute(new CreateCommentLikeCommand(dto));
      return;
    }

    if (like.status === dto.likeStatus) {
      return;
    }

    like.updateLikeStatus(dto.likeStatus);

    await this.commentsLikesRepository.save(like);
  }
}
