import { BaseEntity } from '../../../../core/entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../../user-accounts/entities/user.entity';
import { CreateCommentEntityDto } from './dto/create-comment.entity-dto';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Entity({ name: 'Comments' })
export class Comment extends BaseEntity {
  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'varchar', length: contentConstraints.maxLength })
  content: string;

  static create(dto: CreateCommentEntityDto): Comment {
    const comment = new this();

    comment.postId = dto.postId;
    comment.userId = dto.userId;
    comment.content = dto.content;

    return comment;
  }

  updateContent(content: string): void {
    this.content = content;
  }
}
