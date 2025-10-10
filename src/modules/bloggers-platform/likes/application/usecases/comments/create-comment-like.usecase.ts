import { CreateCommentLikeDto } from './dto/create-comment-like.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsLikesRepository } from '../../../infrastructure/comments-likes.repository';
import { CommentLike } from '../../../entities/comment-like.entity';

export class CreateCommentLikeCommand {
  constructor(public dto: CreateCommentLikeDto) {}
}

@CommandHandler(CreateCommentLikeCommand)
export class CreateCommentLikeUseCase
  implements ICommandHandler<CreateCommentLikeCommand>
{
  constructor(private commentsLikesRepository: CommentsLikesRepository) {}

  async execute({ dto }: CreateCommentLikeCommand): Promise<void> {
    const commentLike = CommentLike.create({
      userId: Number(dto.userId),
      commentId: dto.commentId,
      likeStatus: dto.likeStatus,
    });

    await this.commentsLikesRepository.save(commentLike);
  }
}
