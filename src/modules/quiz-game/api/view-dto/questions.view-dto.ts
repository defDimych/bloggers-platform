import { Question } from '../../entities/question.entity';

export class QuestionsViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;

  static mapToView = (question: Question): QuestionsViewDto => {
    const viewDto = new this();

    viewDto.id = question.id;
    viewDto.body = question.body;
    viewDto.correctAnswers = question.correctAnswers;
    viewDto.published = question.published;
    viewDto.createdAt = question.createdAt.toISOString();
    viewDto.updatedAt = question.updatedAt.toISOString();

    return viewDto;
  };
}
