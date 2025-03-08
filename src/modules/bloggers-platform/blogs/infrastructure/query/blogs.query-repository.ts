import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({ _id: id });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return BlogViewDto.mapToView(blog);
  }
}
