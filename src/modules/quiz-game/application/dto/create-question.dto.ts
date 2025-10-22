import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { bodyConstraints } from '../../entities/question.entity';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateQuestionDto {
  @IsStringWithTrim(bodyConstraints.minLength, bodyConstraints.maxLength)
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Trim()
  correctAnswers: string[];
}
