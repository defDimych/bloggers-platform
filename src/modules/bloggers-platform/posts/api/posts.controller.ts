import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostViewDto } from './view-dto/posts.view-dto';
import { getPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment.input-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { ExtractUserFromRequest } from '../../../auth/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../auth/guards/dto/user-context.dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../../auth/guards/bearer/jwt-auth.guard';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';
import { PostsService } from '../application/posts.service';
import { OptionalUserIdFromRequest } from '../../common/decorators/param/optional-user-id-from-request';
import { UpdateLikeStatusInputDto } from '../../likes/api/input-dto/update-like-status.input-dto';
import { UpdatePostLikeStatusCommand } from '../../likes/application/usecases/posts/update-post-like-status.usecase';
import { IdValidationTransformationPipe } from '../../../../core/pipes/id-validation-transformation.pipe';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
    private postsService: PostsService,
    private commandBus: CommandBus,
  ) {}
  @Get(':id')
  async getPost(
    @Param('id', IdValidationTransformationPipe) id: number,
    @OptionalUserIdFromRequest() userId: number | null,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.findPostByIdOrNotFoundFail(id, userId);
  }

  @Get()
  async getPosts(
    @Query() query: getPostsQueryParams,
    @OptionalUserIdFromRequest() userId: number | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAllPostsWithOptionalBlogId({
      queryParams: query,
      userId,
    });
  }

  @Get(':postId/comments')
  async getComments(
    @OptionalUserIdFromRequest() userId: number | null,
    @Param('postId', IdValidationTransformationPipe) postId: number,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsService.checkPostExistsOrThrow(postId);

    return this.commentsQueryRepository.getAllCommentsForPost({
      queryParams: query,
      userId: userId,
      postId: postId,
    });
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('postId', IdValidationTransformationPipe) postId: number,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<CommentViewDto> {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand({
        userId: user.userId,
        postId,
        content: body.content,
      }),
    );

    return this.commentsQueryRepository.getCommentByIdOrNotFoundFail({
      commentId,
      userId: Number(user.userId),
    });
  }

  @Put(':postId/like-status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId', IdValidationTransformationPipe) postId: number,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdatePostLikeStatusCommand({
        postId,
        likeStatus: body.likeStatus,
        userId: user.userId,
      }),
    );
  }
}
