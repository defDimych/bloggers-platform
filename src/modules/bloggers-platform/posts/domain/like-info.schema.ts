import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../common/types/like-status.enum';

@Schema({ timestamps: true })
export class LikeInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatus),
    default: LikeStatus.None,
  })
  myStatus: LikeStatus;

  @Prop({ type: String, required: true })
  userLogin: string;

  createdAt: Date;
  updatedAt: Date;
}

export const LikeInfoSchema = SchemaFactory.createForClass(LikeInfo);
