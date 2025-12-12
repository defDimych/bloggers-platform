import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { AnswerStatus } from '../../common/answer-status.enum';
import { Answer } from '../../entities/answer.entity';
import { AnswersRepository } from '../../infrastructure/answers.repository';
import { GamesRepository } from '../../infrastructure/games.repository';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { GAME_QUESTIONS_LIMIT } from '../../common/constants/game-questions-limit';
import { GamesStatsService } from '../games-stats.service';

export class ProcessingAnswerCommand extends Command<string> {
  constructor(public dto: { answer: string; userId: string }) {
    super();
  }
}

@CommandHandler(ProcessingAnswerCommand)
export class ProcessingAnswerUseCase
  implements ICommandHandler<ProcessingAnswerCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,
    private answersRepository: AnswersRepository,
    private playersRepository: PlayersRepository,
    private gamesStatsService: GamesStatsService,
  ) {}

  async execute({ dto }: ProcessingAnswerCommand): Promise<string> {
    const userId = Number(dto.userId);

    const game =
      await this.gamesRepository.findActiveWithRelationsByUserId(userId);

    if (!game) {
      throw new DomainException({
        message: "Sorry, you don't have an active pair at the moment.",
        code: DomainExceptionCode.Forbidden,
      });
    }

    const currentPlayer =
      game.firstPlayer.userId === userId
        ? game.firstPlayer
        : game.secondPlayer!;

    if (currentPlayer.answers.length === GAME_QUESTIONS_LIMIT) {
      throw new DomainException({
        message: "Sorry, but you've already answered all the questions.",
        code: DomainExceptionCode.Forbidden,
      });
    }

    const currentQuestion = game.gameQuestions[currentPlayer.answers.length];
    const answerStatus = currentQuestion.question.correctAnswers.includes(
      dto.answer,
    )
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    if (answerStatus === AnswerStatus.Correct) {
      currentPlayer.incrementScore();
      await this.playersRepository.save(currentPlayer);
    }

    const answer = Answer.create({
      questionId: currentQuestion.question.id,
      playerId: currentPlayer.id,
      status: answerStatus,
    });

    const savedAnswer = await this.answersRepository.save(answer);

    const opponentPlayer =
      game.firstPlayer.userId !== userId
        ? game.firstPlayer
        : game.secondPlayer!;

    if (
      opponentPlayer.answers.length === GAME_QUESTIONS_LIMIT &&
      currentPlayer.answers.length + 1 === GAME_QUESTIONS_LIMIT
    ) {
      const opponentHasCorrectAnswer = opponentPlayer.answers.some(
        (a) => a.status === AnswerStatus.Correct,
      );

      if (opponentHasCorrectAnswer) {
        opponentPlayer.incrementScore();
        await this.playersRepository.updateScore({
          playerId: opponentPlayer.id,
          score: opponentPlayer.score,
        });
      }

      game.switchGameStatusToFinished();

      await this.gamesStatsService.recordStatistic({
        currentPlayer,
        opponentPlayer,
      });
      await this.gamesRepository.save(game);
    }

    return savedAnswer.id;
  }
}
