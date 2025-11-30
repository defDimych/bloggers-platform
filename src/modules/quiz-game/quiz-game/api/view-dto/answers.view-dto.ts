import { AnswerStatus } from '../../common/answer-status.enum';
import { Answer } from '../../entities/answer.entity';

export class AnswersViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;

  static mapToView(answer: Answer) {
    const dto = new this();

    dto.questionId = answer.questionId;
    dto.answerStatus = answer.status;
    dto.addedAt = answer.createdAt.toISOString();

    return dto;
  }
}
