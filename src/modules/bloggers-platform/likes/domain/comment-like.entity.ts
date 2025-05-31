import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../types/like-status.enum';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain-dto';

@Schema()
export class CommentLike {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentId: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    default: LikeStatus.None,
  })
  myStatus: LikeStatus;

  static createInstance(dto: CreateLikeDomainDto): CommentLikeDocument {
    const like = new this();

    like.userId = dto.userId;
    like.commentId = dto.commentId;
    like.myStatus = dto.likeStatus;

    return like as CommentLikeDocument;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.myStatus = likeStatus;
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

//регистрирует методы сущности в схеме
CommentLikeSchema.loadClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;

// Типизация модели + статические методы
export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
