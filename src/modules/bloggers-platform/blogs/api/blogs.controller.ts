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
  UseGuards,
} from '@nestjs/common';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { getBlogsQueryParams } from './input-dto/get-blogs.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { getPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { OptionalUserIdFromRequest } from '../../common/decorators/param/optional-user-id-from-request';
import { BasicAuthGuard } from '../../../auth/guards/basic/basic-auth.guard';
import { Public } from '../../../auth/guards/decorators/public.decorator';
import { IdValidationTransformationPipe } from '../../../../core/pipes/id-validation-transformation.pipe';
import { UpdatePostForBlogInputDto } from './input-dto/update-post-for-blog.input-dto';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @Public()
  async getAllBlogs(
    @Query() query: getBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Get('/:blogId/posts')
  @Public()
  async getPostsForBlog(
    @Param('blogId', IdValidationTransformationPipe) blogId: number,
    @Query() query: getPostsQueryParams,
    @OptionalUserIdFromRequest() userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // TODO Move to blog service
    await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    return this.postsQueryRepository.getPosts(query, userId, blogId);
  }

  @Get(':id')
  @Public()
  async getBlog(
    @Param('id', IdValidationTransformationPipe) id: number,
  ): Promise<BlogViewDto> {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Post('/:blogId/posts')
  async createPostForBlog(
    @Param('blogId', IdValidationTransformationPipe) blogId: number,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(
      new CreatePostCommand({
        ...body,
        blogId,
      }),
    );

    return this.postsQueryRepository.findPostByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', IdValidationTransformationPipe) id: number,
    @Body() body: UpdateBlogDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostForBlog(
    @Param('blogId', IdValidationTransformationPipe) blogId: number,
    @Param('postId', IdValidationTransformationPipe) postId: number,
    @Body() body: UpdatePostForBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostCommand({
        postId: postId,
        blogId: blogId,
        content: body.content,
        shortDescription: body.shortDescription,
        title: body.title,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', IdValidationTransformationPipe) id: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
