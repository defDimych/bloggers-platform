import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../common/types/like-status.enum';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostLikeDomainDto } from './dto/create-post-like.domain-dto';

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    default: LikeStatus.None,
  })
  myStatus: LikeStatus;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(dto: CreatePostLikeDomainDto): PostLikeDocument {
    const like = new this();

    like.userId = dto.userId;
    like.postId = dto.postId;
    like.myStatus = dto.likeStatus;
    like.userLogin = dto.userLogin;

    return like as PostLikeDocument;
  }

  updateLikeStatus(likeStatus: LikeStatus) {
    this.myStatus = likeStatus;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

//регистрирует методы сущности в схеме
PostLikeSchema.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;

// Типизация модели + статические методы
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
