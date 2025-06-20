import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../domain/post-like.entity';
import { LikeStatus } from '../../common/types/like-status.enum';

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectModel(PostLike.name)
    private PostLikeModel: PostLikeModelType,
  ) {}

  async getNewestLikes(postId: string): Promise<PostLikeDocument[]> {
    return this.PostLikeModel.find({ postId, myStatus: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(3);
  }

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
