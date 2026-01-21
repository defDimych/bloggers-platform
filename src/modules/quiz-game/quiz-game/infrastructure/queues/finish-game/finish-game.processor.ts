import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GamesRepository } from '../../games.repository';
import { AnswersRepository } from '../../answers.repository';
import { Answer } from '../../../entities/answer.entity';
import { AnswerStatus } from '../../../common/answer-status.enum';
import { GamesService } from '../../../application/games.service';

@Processor('finish-game-queue')
export class FinishGameProcessor extends WorkerHost {
  constructor(
    private gamesRepository: GamesRepository,
    private answersRepository: AnswersRepository,
    private gamesService: GamesService,
  ) {
    super();
  }
  async process(job: Job<{ opponentUserId: number }>) {
    const { opponentUserId } = job.data;

    const game =
      await this.gamesRepository.findActiveWithRelationsByUserId(
        opponentUserId,
      );

    if (!game) return;

    // TODO: Вынести определение игрока на уровень entity метода
    const currentPlayer =
      game.firstPlayer.userId === opponentUserId
        ? game.firstPlayer
        : game.secondPlayer!;

    // Все неотвеченные вопросы воспринимаются как если бы на них был неверный ответ. Answer.create
    const unansweredQuestions = game.gameQuestions.slice(
      currentPlayer.answers.length,
    );

    const promises = unansweredQuestions.map((q) =>
      this.answersRepository.save(
        Answer.create({
          questionId: q.questionId,
          playerId: currentPlayer.id,
          status: AnswerStatus.Incorrect,
        }),
      ),
    );

    await Promise.all(promises);

    const opponentPlayer =
      game.firstPlayer.userId !== opponentUserId
        ? game.firstPlayer
        : game.secondPlayer!;

    // Завершение игры, подсчёт бонусного балла и статистики
    game.switchGameStatusToFinished();

    await this.gamesRepository.save(game);
    await this.gamesService.processGameResult({
      currentPlayer,
      opponentPlayer,
    });
  }
}
