import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Matches, MaxLength } from 'class-validator';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../entities/blog.entity';

export class CreateBlogDto {
  @IsStringWithTrim(2, nameConstraints.maxLength)
  name: string;

  @IsStringWithTrim(2, descriptionConstraints.maxLength)
  description: string;

  @Matches(websiteUrlConstraints.match)
  @MaxLength(websiteUrlConstraints.maxLength)
  websiteUrl: string;
}
