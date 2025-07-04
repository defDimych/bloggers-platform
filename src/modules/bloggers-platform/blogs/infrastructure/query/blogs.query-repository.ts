import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { getBlogsQueryParams } from '../../api/input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAll(
    query: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const filter = query.searchNameTerm
      ? {
          name: { $regex: query.searchNameTerm, $options: 'i' },
          deletedAt: null,
        }
      : { deletedAt: null };

    const blogs = await this.BlogModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.BlogModel.countDocuments(filter);

    const items = blogs.map(BlogViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({ _id: id, deletedAt: null });

    if (!blog) {
      throw new DomainException({
        message: `blog by id:${id} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }
    return BlogViewDto.mapToView(blog);
  }
}
