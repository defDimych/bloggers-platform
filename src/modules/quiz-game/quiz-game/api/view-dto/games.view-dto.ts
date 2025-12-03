import { GameStatus } from '../../common/game-status.enum';
import { Game } from '../../entities/game.entity';
import { PlayerProgressViewDto } from './player-progress.view-dto';

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
}
