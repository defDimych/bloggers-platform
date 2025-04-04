import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { getBlogsQueryParams } from './input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { getPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get('/:blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: getPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.getPosts(query, blogId);
  }

  @Get(':id')
  async getBlog(@Param('id') id: string): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Post('/:blogId/posts')
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.createPost({
      ...body,
      blogId,
    });

    return this.postsQueryRepository.findByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param('id') id: string, @Body() body: UpdateBlogDto) {
    return this.blogsService.updateBlog(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }
}
