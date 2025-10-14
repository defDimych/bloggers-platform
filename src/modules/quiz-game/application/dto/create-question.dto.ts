import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { bodyConstraints } from '../../entities/question.entity';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateQuestionDto {
  @IsStringWithTrim(bodyConstraints.minLength, bodyConstraints.maxLength)
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Trim()
  correctAnswers: string[];
}
