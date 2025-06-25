import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import {
  descriptionConstraints,
  nameConstraints,
  websiteUrlConstraints,
} from '../domain/blog.entity';
import { Matches, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsStringWithTrim(2, nameConstraints.maxLength)
  name: string;

  @IsStringWithTrim(2, descriptionConstraints.maxLength)
  description: string;

  @Matches(websiteUrlConstraints.match)
  @MaxLength(websiteUrlConstraints.maxLength)
  websiteUrl: string;
}
