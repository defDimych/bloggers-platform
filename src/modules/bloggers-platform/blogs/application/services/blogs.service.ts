import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsService {
  constructor(private blogsRepository: BlogsRepository) {}

  async blogIsExistsOrThrow(blogId: number): Promise<void> {
    const blog = await this.blogsRepository.findBlogById(blogId);

    if (!blog) {
      throw new DomainException({
        message: `Blog by id:${blogId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }
  }
}
