import { LikeStatus } from '../../../common/types/like-status.enum';
import { IsEnum } from 'class-validator';

export class UpdateLikeStatusInputDto {
  @IsEnum(LikeStatus, { message: 'status must be a valid enum value' })
  likeStatus: LikeStatus;
}
