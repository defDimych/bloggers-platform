import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../core/entities/base.entity';
import { CreateBlogEntityDto } from './dto/create-blog.entity-dto';
import { UpdateBlogEntityDto } from './dto/update-blog.entity-dto';

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
export class Blog extends BaseEntity {
  @Column({ type: 'varchar', length: nameConstraints.maxLength })
  name: string;

  @Column({ type: 'varchar', length: descriptionConstraints.maxLength })
  description: string;

  @Column({ type: 'varchar', length: websiteUrlConstraints.maxLength })
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

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
