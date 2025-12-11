import { GameStatus } from '../../common/game-status.enum';
import { Game } from '../../entities/game.entity';
import { PlayerProgressViewDto } from './player-progress.view-dto';
import { GameRawType } from '../../infrastructure/query/game-raw.type';

type QuestionInfo = {
  id: string;
  body: string;
};

export class GameViewDto {
  id: string;
  firstPlayerProgress: PlayerProgressViewDto;
  secondPlayerProgress: PlayerProgressViewDto | null;
  questions: QuestionInfo[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;

  static mapToView(game: Game): GameViewDto {
    const dto = new this();

    dto.id = game.id.toString();
    dto.firstPlayerProgress = PlayerProgressViewDto.mapToView(game.firstPlayer);
    dto.secondPlayerProgress = game.secondPlayer
      ? PlayerProgressViewDto.mapToView(game.secondPlayer)
      : null;
    dto.questions = game.gameQuestions.length
      ? game.gameQuestions.map((q) => ({
          id: q.question.id,
          body: q.question.body,
        }))
      : null;
    dto.status = game.status;
    dto.pairCreatedDate = game.createdAt.toISOString();
    dto.startGameDate = game.startedAt ? game.startedAt.toISOString() : null;
    dto.finishGameDate = game.finishedAt ? game.finishedAt.toISOString() : null;

    return dto;
  }

  // TODO: зарефакторить маппинг
  static mapRawToView = (gameRaw: GameRawType): GameViewDto => {
    const dto = new this();

    dto.id = gameRaw.gameId.toString();
    dto.firstPlayerProgress = {
      answers: gameRaw.firstPlayerAnswers
        ? gameRaw.firstPlayerAnswers.map((a) => ({
            questionId: a.questionId,
            answerStatus: a.answerStatus,
            addedAt: a.addedAt.toISOString(),
          }))
        : [],

      player: {
        id: gameRaw.firstPlayerUserId.toString(),
        login: gameRaw.firstPlayerLogin,
      },

      score: gameRaw.firstPlayerScore,
    };

    if (gameRaw.gameStatus === GameStatus.PendingSecondPlayer) {
      dto.secondPlayerProgress = null;
    } else {
      dto.secondPlayerProgress = {
        answers: gameRaw.secondPlayerAnswers
          ? gameRaw.secondPlayerAnswers.map((a) => ({
              questionId: a.questionId,
              answerStatus: a.answerStatus,
              addedAt: a.addedAt.toISOString(),
            }))
          : [],

        player: {
          id: gameRaw.secondPlayerUserId!.toString(),
          login: gameRaw.secondPlayerLogin!,
        },

        score: gameRaw.secondPlayerScore!,
      };
    }

    dto.questions = gameRaw.gameQuestions
      ? gameRaw.gameQuestions.map((q) => ({
          id: q.questionId,
          body: q.body,
        }))
      : null;

    dto.status = gameRaw.gameStatus;
    dto.pairCreatedDate = gameRaw.createdAt.toISOString();
    dto.startGameDate = gameRaw.startedAt
      ? gameRaw.startedAt.toISOString()
      : null;
    dto.finishGameDate = gameRaw.finishedAt
      ? gameRaw.finishedAt.toISOString()
      : null;

    return dto;
  };
}
