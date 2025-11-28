import { AnswerStatus } from '../../common/answer-status.enum';

export class CreateAnswerEntityDto {
  questionId: string;
  playerId: string;
  status: AnswerStatus;
}
