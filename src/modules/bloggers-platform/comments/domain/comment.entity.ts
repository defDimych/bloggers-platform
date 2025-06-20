import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Commentator, CommentatorSchema } from './commentator.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDomainDto } from './dto/create-comment.domain-dto';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: CommentatorSchema, required: true })
  commentatorInfo: Commentator;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true, ...contentConstraints })
  content: string;

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();

    comment.postId = dto.postId;
    comment.content = dto.content;
    comment.commentatorInfo = dto.commentatorInfo;

    return comment as CommentDocument;
  }

  update(content: string): void {
    this.content = content;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

// Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;
