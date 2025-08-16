import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { Injectable } from '@nestjs/common';
import { getBlogsQueryParams } from '../../api/input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDbModel } from '../types/blog-db-model.type';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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

      const items = blogs.map(BlogViewDto.mapToView);

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

  async getByIdOrNotFoundFail(id: number): Promise<BlogViewDto> {
    const result = await this.dataSource.query<BlogDbModel[]>(
      `SELECT * FROM "Blogs" WHERE id = $1 AND "deletedAt" IS NULL;`,
      [id],
    );

    if (!result.length) {
      throw new DomainException({
        message: `blog by id:${id} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }
    return BlogViewDto.mapToView(result[0]);
  }
}
