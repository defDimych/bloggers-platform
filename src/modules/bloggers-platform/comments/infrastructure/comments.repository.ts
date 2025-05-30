import { CommentDocument } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }
}
