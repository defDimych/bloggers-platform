import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async findById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({ _id: id });
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
