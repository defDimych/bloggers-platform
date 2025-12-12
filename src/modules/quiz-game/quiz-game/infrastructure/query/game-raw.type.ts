import { GameStatus } from '../../common/game-status.enum';
import { AnswerStatus } from '../../common/answer-status.enum';

type AnswerType = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

type QuestionType = {
  questionId: string;
  body: string;
};

export type GameRawType = {
  gameId: number;
  gameStatus: GameStatus;
  createdAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  firstPlayerAnswers: AnswerType[] | null;
  firstPlayerScore: number;
  firstPlayerUserId: number;
  firstPlayerLogin: string;
  secondPlayerAnswers: AnswerType[] | null;
  secondPlayerScore: number | null;
  secondPlayerUserId: number | null;
  secondPlayerLogin: string | null;
  gameQuestions: QuestionType[] | null;
};
