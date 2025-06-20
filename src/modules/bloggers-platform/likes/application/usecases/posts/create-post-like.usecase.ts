import { CreatePostLikeDto } from './dto/create-post-like.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeModelType } from '../../../domain/post-like.entity';
import { PostLikeRepository } from '../../../infrastructure/post-like.repository';
import { UpdatePostLikeCounterCommand } from './update-post-like-counter.usecase';
import { LikeStatus } from '../../../../common/types/like-status.enum';

export class CreatePostLikeCommand {
  constructor(public dto: CreatePostLikeDto) {}
}

@CommandHandler(CreatePostLikeCommand)
export class CreatePostLikeUseCase
  implements ICommandHandler<CreatePostLikeCommand>
{
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
    private postLikeRepository: PostLikeRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: CreatePostLikeCommand): Promise<void> {
    const like = this.PostLikeModel.createInstance(dto);

    await this.postLikeRepository.save(like);

    await this.commandBus.execute(
      new UpdatePostLikeCounterCommand({
        postId: dto.postId,
        likeStatus: dto.likeStatus,
        currentStatus: LikeStatus.None,
      }),
    );
  }
}
