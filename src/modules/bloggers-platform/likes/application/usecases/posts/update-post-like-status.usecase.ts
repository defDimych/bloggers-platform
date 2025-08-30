import { UpdatePostLikeStatusDto } from './dto/update-post-like-status.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PostLikeRepository } from '../../../infrastructure/post-like.repository';
import { CreatePostLikeCommand } from './create-post-like.usecase';

export class UpdatePostLikeStatusCommand {
  constructor(public dto: UpdatePostLikeStatusDto) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private postLikeRepository: PostLikeRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findPostById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: `post by id:${dto.postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const like = await this.postLikeRepository.findPostLike({
      postId: dto.postId,
      userId: Number(dto.userId),
    });

    if (!like) {
      await this.commandBus.execute(new CreatePostLikeCommand(dto));
      return;
    }

    if (like.status === dto.likeStatus) {
      return;
    }

    await this.postLikeRepository.updatePostLikeStatus({
      likeId: like.id,
      likeStatus: dto.likeStatus,
    });
  }
}
