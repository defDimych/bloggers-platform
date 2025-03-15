import { PostDocument } from '../domain/post.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsRepository {
  async save(post: PostDocument) {
    await post.save();
  }
}
