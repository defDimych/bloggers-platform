import { IsMongoId } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  contentConstraints,
  shortDescriptionConstraints,
  titleConstraints,
} from '../domain/post.entity';

export class UpdatePostDto {
  @IsMongoId()
  blogId: string;

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
