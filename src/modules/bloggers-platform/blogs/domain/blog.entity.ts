import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateBlogDomainDto } from './dto/CreateBlogDomainDto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateBlogDto } from '../dto/update-blog.dto';

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

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true, ...nameConstraints })
  name: string;

  @Prop({ type: String, required: true, ...descriptionConstraints })
  description: string;

  @Prop({
    type: String,
    required: true,
    maxlength: websiteUrlConstraints.maxLength,
  })
  websiteUrl: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return blog as BlogDocument;
  }

  update(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

// Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
