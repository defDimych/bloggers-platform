import { CreatePostLikeDto } from './dto/create-post-like.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsLikesRepository } from '../../../infrastructure/posts-likes.repository';
import { PostLike } from '../../../entities/post-like.entity';

export class CreatePostLikeCommand {
  constructor(public dto: CreatePostLikeDto) {}
}

@CommandHandler(CreatePostLikeCommand)
export class CreatePostLikeUseCase
  implements ICommandHandler<CreatePostLikeCommand>
{
  constructor(private postsLikesRepository: PostsLikesRepository) {}

  async execute({ dto }: CreatePostLikeCommand): Promise<void> {
    const postLike = PostLike.create({
      postId: dto.postId,
      userId: Number(dto.userId),
      likeStatus: dto.likeStatus,
    });

    await this.postsLikesRepository.save(postLike);
  }
}
