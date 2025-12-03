import { Player } from '../../entities/player.entity';
import { AnswerStatus } from '../../common/answer-status.enum';

type AnswerInfo = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

type PlayerInfo = {
  id: string;
  login: string;
};

export class PlayerProgressViewDto {
  answers: AnswerInfo[] | [];
  player: PlayerInfo;
  score: number;

  static mapToView(player: Player): PlayerProgressViewDto {
    const dto = new this();

    dto.answers = player.answers.length
      ? player.answers.map((a) => ({
          questionId: a.questionId,
          answerStatus: a.status,
          addedAt: a.createdAt.toISOString(),
        }))
      : [];

    dto.player = {
      id: player.userId.toString(),
      login: player.user.login,
    };

    dto.score = player.score;

    return dto;
  }
}
