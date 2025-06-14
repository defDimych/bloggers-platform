import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateCommentCommand {
  constructor(public dto: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute({ dto }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findById(dto.commentId);

    if (!comment) {
      throw new DomainException({
        message: 'comment not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    if (comment.commentatorInfo.userId !== dto.userId) {
      throw new DomainException({
        message: 'access error',
        code: DomainExceptionCode.Forbidden,
      });
    }

    comment.update(dto.content);

    await this.commentsRepository.save(comment);
  }
}
