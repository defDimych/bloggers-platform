import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain-dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../dto/update-post.dto';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;

    return post as PostDocument;
  }

  update(dto: UpdatePostDto) {
    this.blogId = dto.blogId;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.title = dto.title;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

// Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;
