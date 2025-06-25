import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectModel(PostLike.name)
    private PostLikeModel: PostLikeModelType,
  ) {}

  async findLike(
    userId: string,
    postId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ userId, postId });
  }

  async save(like: PostLikeDocument): Promise<void> {
    await like.save();
  }
}
