import { CreateCommentLikeDto } from './dto/create-comment-like.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikeRepository } from '../../../infrastructure/comment-like.repository';

export class CreateCommentLikeCommand {
  constructor(public dto: CreateCommentLikeDto) {}
}

@CommandHandler(CreateCommentLikeCommand)
export class CreateCommentLikeUseCase
  implements ICommandHandler<CreateCommentLikeCommand>
{
  constructor(private commentLikeRepository: CommentLikeRepository) {}

  async execute({ dto }: CreateCommentLikeCommand): Promise<void> {
    await this.commentLikeRepository.createCommentLike({
      commentId: dto.commentId,
      userId: Number(dto.userId),
      likeStatus: dto.likeStatus,
    });
  }
}
