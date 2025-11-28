import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { AnswerStatus } from '../../common/answer-status.enum';
import { Answer } from '../../entities/answer.entity';
import { AnswersRepository } from '../../infrastructure/answers.repository';

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
    private playersRepository: PlayersRepository,
    private answersRepository: AnswersRepository,
  ) {}

  async execute({ dto }: ProcessingAnswerCommand): Promise<string> {
    const userId = Number(dto.userId);

    const player =
      await this.playersRepository.findActivePlayerByUserId(userId);

    console.log(player);

    if (!player) {
      throw new DomainException({
        message: "Sorry, you don't have an active pair at the moment.",
        code: DomainExceptionCode.Forbidden,
      });
    }

    if (player.answers.length === 5) {
      throw new DomainException({
        message: "Sorry, but you've already answered all the questions.",
        code: DomainExceptionCode.Forbidden,
      });
    }

    const game = player.activeGame;

    console.log(game);

    const currentQuestion = game.gameQuestions[player.answers.length];
    const answerStatus = currentQuestion.question.correctAnswers.includes(
      dto.answer,
    )
      ? AnswerStatus.Correct
      : AnswerStatus.Incorrect;

    if (answerStatus === AnswerStatus.Correct) {
      player.incrementScore();
    }

    const answer = Answer.create({
      questionId: currentQuestion.question.id,
      playerId: player.id,
      status: answerStatus,
    });

    await this.answersRepository.save(answer);

    return answer.id;
  }
}
