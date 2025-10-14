import { Column, Entity, OneToMany } from 'typeorm';
import { CreateBlogEntityDto } from './dto/create-blog.entity-dto';
import { UpdateBlogEntityDto } from './dto/update-blog.entity-dto';
import { Post } from '../../posts/entities/post.entity';
import { NumericBaseEntity } from '../../../../core/entities/numeric-base.entity';

export const nameConstraints = {
  maxLength: 15,
};
export const descriptionConstraints = {
  maxLength: 500,
};
export const websiteUrlConstraints = {
  maxLength: 100,
  match: '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
};

@Entity({ name: 'Blogs' })
export class Blog extends NumericBaseEntity {
  @Column({
    type: 'varchar',
    length: nameConstraints.maxLength,
    collation: 'C',
  })
  name: string;

  @Column({ type: 'varchar', length: descriptionConstraints.maxLength })
  description: string;

  @Column({ type: 'varchar', length: websiteUrlConstraints.maxLength })
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  static create(dto: CreateBlogEntityDto): Blog {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog;
  }

  update(dto: UpdateBlogEntityDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
