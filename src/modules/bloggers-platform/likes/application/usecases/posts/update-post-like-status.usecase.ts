import { UpdatePostLikeStatusDto } from './dto/update-post-like-status.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { PostsLikesRepository } from '../../../infrastructure/posts-likes.repository';
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
    private postsLikesRepository: PostsLikesRepository,
    private commandBus: CommandBus,
  ) {}

  async execute({ dto }: UpdatePostLikeStatusCommand): Promise<void> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: `post by id:${dto.postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const like = await this.postsLikesRepository.findLike({
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

    like.updateLikeStatus(dto.likeStatus);

    await this.postsLikesRepository.save(like);
  }
}
