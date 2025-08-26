import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UpdateLikeStatusInputDto } from '../../likes/api/input-dto/update-like-status.input-dto';
import { JwtAuthGuard } from '../../../auth/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../auth/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../auth/guards/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentLikeStatusCommand } from '../../likes/application/usecases/comments/update-comment-like-status.usecase';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { OptionalUserIdFromRequest } from '../../common/decorators/param/optional-user-id-from-request';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { Public } from '../../../auth/guards/decorators/public.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @Public()
  async getById(
    @Param('id') id: string,
    @OptionalUserIdFromRequest() userId: string | null,
    @OptionalUserIdFromRequest() userId: number | null,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getById({
      commentId: id,
      userId,
    });
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Body() body: UpdateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentLikeStatusCommand({
        commentId,
        likeStatus: body.likeStatus,
        userId: user.userId,
      }),
    );
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateCommentCommand({
        commentId,
        content: body.content,
        userId: user.userId,
      }),
    );
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteCommentCommand({ commentId, userId: user.userId }),
    );
  }
}
