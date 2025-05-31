import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../domain/comment-like.entity';

@Injectable()
export class CommentLikeRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async findLike(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ userId, commentId });
  }

  async save(like: CommentLikeDocument): Promise<void> {
    await like.save();
  }
}
