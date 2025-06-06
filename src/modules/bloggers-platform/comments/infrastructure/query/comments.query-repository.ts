import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import {
  CommentLike,
  CommentLikeModelType,
} from '../../../likes/domain/comment-like.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  async getById(dto: {
    commentId: string;
    userId: string | null;
  }): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findById(dto.commentId);

    if (!comment) {
      throw new DomainException({
        message: 'comment not found',
        code: DomainExceptionCode.NotFound,
      });
    }

    const like = await this.CommentLikeModel.findOne({
      commentId: dto.commentId,
      userId: dto.userId,
    });

    return CommentViewDto.mapToView({ userId: dto.userId, comment, like });
  }
}
