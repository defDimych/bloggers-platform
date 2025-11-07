import { GameStatus } from '../../common/game-status.enum';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

type AnswerInfo = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

type PlayerInfo = {
  id: string;
  login: string;
};

type PlayerProgress = {
  answers: AnswerInfo[] | [];
  player: PlayerInfo;
  score: number;
};

type QuestionInfo = {
  id: string;
  body: string;
};

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgress;
  secondPlayerProgress: PlayerProgress | null;
  questions: QuestionInfo[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;

  static mapToView() {}
}
