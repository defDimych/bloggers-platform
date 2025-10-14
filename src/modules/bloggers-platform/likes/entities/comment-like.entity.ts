import { Column, Entity, ManyToOne } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { User } from '../../../user-accounts/entities/user.entity';
import { LikeStatus } from '../../common/types/like-status.enum';
import { CreateCommentLikeEntityDto } from './dto/create-comment-like.entity-dto';
import { NumericBaseEntity } from '../../../../core/entities/numeric-base.entity';

@Entity({ name: 'CommentsLikes' })
export class CommentLike extends NumericBaseEntity {
  @ManyToOne(() => Comment, (comment) => comment.commentLikes)
  comment: Comment;

  @Column()
  commentId: number;

  @ManyToOne(() => User, (user) => user.commentLikes)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: LikeStatus })
  status: LikeStatus;

  static create(dto: CreateCommentLikeEntityDto): CommentLike {
    const commentLike = new this();

    commentLike.userId = dto.userId;
    commentLike.commentId = dto.commentId;
    commentLike.status = dto.likeStatus;

    return commentLike;
  }

  updateLikeStatus(likeStatus: LikeStatus): void {
    this.status = likeStatus;
  }
}
