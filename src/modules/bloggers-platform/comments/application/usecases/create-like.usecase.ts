import { CreateLikeDto } from '../dto/create-like.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeModelType,
} from '../../../likes/domain/comment-like.entity';
import { CommentLikeRepository } from '../../../likes/infrastructure/comment-like.repository';
import { UpdateLikesCountCommand } from './update-likes-count.usecase';
import { LikeStatus } from '../../../types/like-status.enum';

export class CreateLikeCommand {
  constructor(public dto: CreateLikeDto) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    private commentLikeRepository: CommentLikeRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: CreateLikeCommand): Promise<void> {
    const like = this.CommentLikeModel.createInstance(dto);

    await this.commentLikeRepository.save(like);

    await this.commandBus.execute(
      new UpdateLikesCountCommand({
        commentId: dto.commentId,
        likeStatus: dto.likeStatus,
        currentStatus: LikeStatus.None,
      }),
    );
  }
}
