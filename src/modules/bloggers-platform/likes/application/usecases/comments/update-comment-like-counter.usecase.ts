import { UpdateCommentLikeCounterDto } from './dto/update-comment-like-counter.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../../comments/infrastructure/comments.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { LikeStatus } from '../../../../common/types/like-status.enum';

export class UpdateCommentLikeCounterCommand {
  constructor(public dto: UpdateCommentLikeCounterDto) {}
}

@CommandHandler(UpdateCommentLikeCounterCommand)
export class UpdateCommentLikeCounterUseCase
  implements ICommandHandler<UpdateCommentLikeCounterCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ dto }: UpdateCommentLikeCounterCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(dto.commentId);

    if (!comment) {
      throw new DomainException({
        message: 'comment not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    if (
      dto.currentStatus === LikeStatus.None &&
      dto.likeStatus === LikeStatus.Like
    ) {
      comment.likesCount++;
    } else if (
      dto.currentStatus === LikeStatus.None &&
      dto.likeStatus === LikeStatus.Dislike
    ) {
      comment.dislikesCount++;
    } else if (
      dto.currentStatus === LikeStatus.Like &&
      dto.likeStatus === LikeStatus.None
    ) {
      comment.likesCount--;
    } else if (
      dto.currentStatus === LikeStatus.Dislike &&
      dto.likeStatus === LikeStatus.None
    ) {
      comment.dislikesCount--;
    } else if (
      dto.currentStatus === LikeStatus.Like &&
      dto.likeStatus === LikeStatus.Dislike
    ) {
      comment.likesCount--;
      comment.dislikesCount++;
    } else if (
      dto.currentStatus === LikeStatus.Dislike &&
      dto.likeStatus === LikeStatus.Like
    ) {
      comment.dislikesCount--;
      comment.likesCount++;
    }

    await this.commentsRepository.save(comment);
  }
}
