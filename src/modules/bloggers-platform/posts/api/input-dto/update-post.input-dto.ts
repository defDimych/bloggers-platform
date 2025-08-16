import { IsNumber } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../../domain/post.entity';

export class UpdatePostInputDto {
  @IsNumber()
  blogId: number;

  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @IsStringWithTrim(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrim(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;
}
