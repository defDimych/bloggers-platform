import { BaseEntity } from '../../../../core/entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { CreatePostEntityDto } from './dto/create-post.entity-dto';
import { UpdatePostEntityDto } from './dto/update-post.entity-dto';
import { Comment } from '../../comments/entities/comment.entity';
import { PostLike } from '../../likes/entities/post-like.entity';

export const titleConstraints = {
  minLength: 2,
  maxLength: 30,
};
export const shortDescriptionConstraints = {
  minLength: 2,
  maxLength: 100,
};
export const contentConstraints = {
  minLength: 2,
  maxLength: 1000,
};

@Entity({ name: 'Posts' })
export class Post extends BaseEntity {
  @ManyToOne(() => Blog, (blog) => blog.posts)
  blog: Blog;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post)
  postLikes: PostLike[];

  @Column()
  blogId: number;

  @Column({ type: 'varchar', length: titleConstraints.maxLength })
  title: string;

  @Column({ type: 'varchar', length: shortDescriptionConstraints.maxLength })
  shortDescription: string;

  @Column({ type: 'varchar', length: contentConstraints.maxLength })
  content: string;

  static create(dto: CreatePostEntityDto): Post {
    const post = new this();

    post.blogId = dto.blogId;
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    return post;
  }

  update(dto: UpdatePostEntityDto): void {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
  }
}
