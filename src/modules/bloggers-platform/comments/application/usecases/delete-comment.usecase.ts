import { DeleteCommentDto } from '../dto/delete-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(public dto: DeleteCommentDto) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ dto }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(dto.commentId);

    if (!comment) {
      throw new DomainException({
        message: `comment by id:${dto.commentId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    if (comment.userId !== Number(dto.userId)) {
      throw new DomainException({
        message: 'You do not have permission to delete this comment',
        code: DomainExceptionCode.Forbidden,
      });
    }

    comment.makeDeleted();

    await this.commentsRepository.save(comment);
  }
}
