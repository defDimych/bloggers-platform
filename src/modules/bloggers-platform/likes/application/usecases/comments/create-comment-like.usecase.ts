import { CreateCommentLikeDto } from './dto/create-comment-like.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeModelType,
} from '../../../domain/comment-like.entity';
import { CommentLikeRepository } from '../../../infrastructure/comment-like.repository';
import { UpdateCommentLikeCounterCommand } from './update-comment-like-counter.usecase';
import { LikeStatus } from '../../../../common/types/like-status.enum';

export class CreateCommentLikeCommand {
  constructor(public dto: CreateCommentLikeDto) {}
}

@CommandHandler(CreateCommentLikeCommand)
export class CreateCommentLikeUseCase
  implements ICommandHandler<CreateCommentLikeCommand>
{
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    private commentLikeRepository: CommentLikeRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: CreateCommentLikeCommand): Promise<void> {
    const like = this.CommentLikeModel.createInstance(dto);

    await this.commentLikeRepository.save(like);

    await this.commandBus.execute(
      new UpdateCommentLikeCounterCommand({
        commentId: dto.commentId,
        likeStatus: dto.likeStatus,
        currentStatus: LikeStatus.None,
      }),
    );
  }
}
