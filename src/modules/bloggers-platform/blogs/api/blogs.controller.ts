import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { getBlogsQueryParams } from './input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { getPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { OptionalUserIdFromRequest } from '../../common/decorators/param/optional-user-id-from-request';
import { IdValidationTransformationPipe } from '../../../../core/pipes/id-validation-transformation.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get(':id')
  async getBlog(
    @Param('id', IdValidationTransformationPipe) id: number,
  ): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAllBlogs(
    @Query() query: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAllBlogs(query);
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param('blogId', IdValidationTransformationPipe) blogId: number,
    @Query() query: getPostsQueryParams,
    @OptionalUserIdFromRequest() userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // TODO Move to blog service
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.getPosts(query, userId, blogId);
  }
}
