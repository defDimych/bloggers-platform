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
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { LikeStatus } from '../../../common/types/like-status.enum';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  async getAll(
    dto: GetAllCommentsDto,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter = dto.userId
      ? { postId: dto.postId, 'commentatorInfo.userId': dto.userId }
      : { postId: dto.postId };

    try {
      const commentsPromise = this.CommentModel.find(filter)
        .sort({ [dto.query.sortBy]: dto.query.sortDirection })
        .skip(dto.query.calculateSkip())
        .limit(dto.query.pageSize)
        .lean();

      const totalCountPromise = this.CommentModel.countDocuments(filter);
      const [comments, totalCount] = await Promise.all([
        commentsPromise,
        totalCountPromise,
      ]);

      const ids = comments.map((comment) => comment._id.toString());
      const likes = await this.CommentLikeModel.find({
        commentId: { $in: ids },
        userId: dto.userId,
      }).lean();

      const dictionaryLikes = likes.reduce((dict, like) => {
        dict.set(like.commentId, like.myStatus);
        return dict;
      }, new Map<string, LikeStatus>());

      const items: CommentViewDto[] = CommentViewDto.mapManyToView({
        userId: dto.userId,
        comments,
        dictionaryLikes,
      });

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: dto.query.pageNumber,
        size: dto.query.pageSize,
      });
    } catch (err) {
      console.log(
        `Comment query repository, getAllComments : ${JSON.stringify(err, null, 2)}`,
      );

      throw new Error(`some error`);
    }
  }

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
