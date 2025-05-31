import { UpdateLikeStatusDto } from '../dto/update-like-status.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentLikeRepository } from '../../../likes/infrastructure/comment-like.repository';
import { CreateLikeCommand } from './create-like.usecase';
import { UpdateLikesCountCommand } from './update-likes-count.usecase';

export class UpdateLikeStatusCommand {
  constructor(public dto: UpdateLikeStatusDto) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase
  implements ICommandHandler<UpdateLikeStatusCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentLikeRepository: CommentLikeRepository,
    private commandBus: CommandBus,
  ) {}
  async execute({ dto }: UpdateLikeStatusCommand): Promise<void> {
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
      await this.commandBus.execute(new CreateLikeCommand(dto));
      return;
    }

    if (like.myStatus === dto.likeStatus) {
      return;
    }

    const oldStatus = like.myStatus;

    like.updateLikeStatus(dto.likeStatus);

    await this.commentLikeRepository.save(like);

    await this.commandBus.execute(
      new UpdateLikesCountCommand({
        commentId: dto.commentId,
        likeStatus: dto.likeStatus,
        currentStatus: oldStatus,
      }),
    );
  }
}
