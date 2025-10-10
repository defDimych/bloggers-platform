import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { User } from '../../../user-accounts/entities/user.entity';
import { LikeStatus } from '../../common/types/like-status.enum';
import { Post } from '../../posts/entities/post.entity';
import { CreatePostLikeEntityDto } from './dto/create-post-like.entity-dto';

@Entity({ name: 'PostsLikes' })
export class PostLike extends BaseEntity {
  @ManyToOne(() => Post, (post) => post.postLikes)
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User, (user) => user.postLikes)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LikeStatus })
  status: LikeStatus;

  static create(dto: CreatePostLikeEntityDto): PostLike {
    const postLike = new this();

    postLike.userId = dto.userId;
    postLike.postId = dto.postId;
    postLike.status = dto.likeStatus;

    return postLike;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.status = likeStatus;
  }
}
