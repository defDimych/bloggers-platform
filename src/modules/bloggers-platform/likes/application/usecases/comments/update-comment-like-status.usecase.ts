import { UpdateCommentLikeStatusDto } from './dto/update-comment-like-status.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { CommentLikeRepository } from '../../../infrastructure/comment-like.repository';
import { CreateCommentLikeCommand } from './create-comment-like.usecase';
import { UpdateCommentLikeCounterCommand } from './update-comment-like-counter.usecase';

export class UpdateCommentLikeStatusCommand {
  constructor(public dto: UpdateCommentLikeStatusDto) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikeRepository: CommentLikeRepository,
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

    const like = await this.commentLikeRepository.findLike(
      dto.userId,
      dto.commentId,
    );

    if (!like) {
      await this.commandBus.execute(new CreateCommentLikeCommand(dto));
      return;
    }

    if (like.myStatus === dto.likeStatus) {
      return;
    }

    const oldStatus = like.myStatus;

    like.updateLikeStatus(dto.likeStatus);

    await this.commentLikeRepository.save(like);

    await this.commandBus.execute(
      new UpdateCommentLikeCounterCommand({
        commentId: dto.commentId,
        likeStatus: dto.likeStatus,
        currentStatus: oldStatus,
      }),
    );
  }
}
