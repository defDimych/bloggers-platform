import { CreatePostLikeDto } from './dto/create-post-like.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikeRepository } from '../../../infrastructure/post-like.repository';

export class CreatePostLikeCommand {
  constructor(public dto: CreatePostLikeDto) {}
}

@CommandHandler(CreatePostLikeCommand)
export class CreatePostLikeUseCase
  implements ICommandHandler<CreatePostLikeCommand>
{
  constructor(private postLikeRepository: PostLikeRepository) {}

  async execute({ dto }: CreatePostLikeCommand): Promise<void> {
    await this.postLikeRepository.createPostLike({
      postId: dto.postId,
      userId: Number(dto.userId),
      likeStatus: dto.likeStatus,
    });
  }
}
