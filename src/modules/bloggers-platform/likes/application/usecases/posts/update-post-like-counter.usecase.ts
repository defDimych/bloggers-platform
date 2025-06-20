import { UpdatePostLikeCounterDto } from './dto/update-post-like-counter.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../../posts/infrastructure/posts.repository';
import { DomainException } from '../../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../../core/exceptions/domain-exception-codes';
import { LikeStatus } from '../../../../common/types/like-status.enum';
import { PostLikeRepository } from '../../../infrastructure/post-like.repository';
import { UsersRepository } from '../../../../../user-accounts/infrastructure/users.repository';

export class UpdatePostLikeCounterCommand {
  constructor(public dto: UpdatePostLikeCounterDto) {}
}

@CommandHandler(UpdatePostLikeCounterCommand)
export class UpdatePostLikeCounterUseCase
  implements ICommandHandler<UpdatePostLikeCounterCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private postLikeRepository: PostLikeRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ dto }: UpdatePostLikeCounterCommand): Promise<void> {
    const post = await this.postsRepository.findById(dto.postId);

    if (!post) {
      throw new DomainException({
        message: `post by id:${dto.postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    if (
      dto.currentStatus === LikeStatus.None &&
      dto.likeStatus === LikeStatus.Like
    ) {
      post.likesCount++;
    } else if (
      dto.currentStatus === LikeStatus.None &&
      dto.likeStatus === LikeStatus.Dislike
    ) {
      post.dislikesCount++;
    } else if (
      dto.currentStatus === LikeStatus.Like &&
      dto.likeStatus === LikeStatus.None
    ) {
      post.likesCount--;
    } else if (
      dto.currentStatus === LikeStatus.Dislike &&
      dto.likeStatus === LikeStatus.None
    ) {
      post.dislikesCount--;
    } else if (
      dto.currentStatus === LikeStatus.Like &&
      dto.likeStatus === LikeStatus.Dislike
    ) {
      post.likesCount--;
      post.dislikesCount++;
    } else if (
      dto.currentStatus === LikeStatus.Dislike &&
      dto.likeStatus === LikeStatus.Like
    ) {
      post.dislikesCount--;
      post.likesCount++;
    }

    const newestLikes = await this.postLikeRepository.getNewestLikes(
      dto.postId,
    );

    const userIds = newestLikes.map((l) => l.userId);
    const users = await this.usersRepository.findUsersById(userIds);

    newestLikes.forEach((l) => {
      const user = users.find((user) => user._id.toString() === l.userId);

      l.userLogin = user!.accountData.login;
    });

    // TODO: вопрос
    post.newestLikes = newestLikes;

    await this.postsRepository.save(post);
  }
}
