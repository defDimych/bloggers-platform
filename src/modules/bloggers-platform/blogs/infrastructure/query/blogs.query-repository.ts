import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Injectable } from '@nestjs/common';
import { getBlogsQueryParams } from '../../api/input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, IsNull, Repository } from 'typeorm';
import { BlogDbModel } from '../types/blog-db-model.type';
import { Blog } from '../../entities/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private readonly blogsRepo: Repository<Blog>,
  ) {}

  async findAllBlogs(
    queryParams: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const where: any[] = [];

    if (queryParams.searchNameTerm) {
      where.push({
        name: ILike(`%${queryParams.searchNameTerm}%`),
        deletedAt: IsNull(),
      });
    }

    if (!where.length) {
      where.push({ deletedAt: IsNull() });
    }

    try {
      const blogs = await this.blogsRepo.findAndCount({
        where,
        order: { [queryParams.sortBy]: queryParams.sortDirection },
        skip: queryParams.calculateSkip(),
        take: queryParams.pageSize,
      });

      const items = blogs[0].map(BlogViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: blogs[1],
        page: queryParams.pageNumber,
        size: queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, findAllBlogs : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async getAllBlogs(
    queryParams: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    let filter = `"deletedAt" IS NULL`;
    let params: string[] | [] = [];

    if (queryParams.searchNameTerm) {
      filter = `name ILIKE $1 AND "deletedAt" IS NULL`;
      params = [`%${queryParams.searchNameTerm}%`];
    }

    try {
      const blogs = await this.dataSource.query<BlogDbModel[]>(
        `SELECT * FROM "Blogs"
WHERE ${filter}
ORDER BY "${queryParams.sortBy}" ${queryParams.sortDirection}
LIMIT ${queryParams.pageSize}
OFFSET ${queryParams.calculateSkip()}`,
        params,
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `SELECT 
COUNT(*) FILTER (WHERE ${filter}) AS "totalCount"
 FROM "Blogs";`,
        params,
      );

      const items = blogs.map(BlogViewDto.mapManyToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCount[0].totalCount),
        page: queryParams.pageNumber,
        size: queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, getAllBlogs : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findBlogByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const blog = await this.blogsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!blog) {
      throw new DomainException({
        message: `blog by id:${id} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return BlogViewDto.mapToView(blog);
  }
}
