import { PostsRepository } from '../infrastructure/posts.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(private postsRepository: PostsRepository) {}

  async checkPostExistsOrThrow(postId: string): Promise<void> {
    const post = await this.postsRepository.findById(postId);

    if (!post) {
      throw new DomainException({
        message: `post by id:${postId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }
  }
}
