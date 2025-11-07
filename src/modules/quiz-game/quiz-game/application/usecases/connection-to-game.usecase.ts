import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../infrastructure/games.repository';
import { Player } from '../../entities/player.entity';
import { Game } from '../../entities/game.entity';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';
import { GameQuestion } from '../../entities/game-question.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';

export class ConnectionToGameCommand extends Command<string> {
  constructor(public dto: { userId: string }) {
    super();
  }
}

@CommandHandler(ConnectionToGameCommand)
export class ConnectionToGameUseCase
  implements ICommandHandler<ConnectionToGameCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,
    private playersRepository: PlayersRepository,
    private questionsRepository: QuestionsRepository,
    private gameQuestionRepository: GameQuestionRepository,
  ) {}

  async execute({ dto }: ConnectionToGameCommand): Promise<string> {
    const foundGame = await this.gamesRepository.findWithPendingSecondPlayer();

    if (!foundGame) {
      const player = Player.create(Number(dto.userId));
      const savedPlayer = await this.playersRepository.save(player);

      const game = Game.create(savedPlayer.id);
      const savedGame = await this.gamesRepository.save(game);

      return savedGame.id;
    }

    const foundPlayer = await this.playersRepository.findByGameIdAndUserId({
      gameId: foundGame.id,
      userId: Number(dto.userId),
    });

    if (foundPlayer) {
      throw new DomainException({
        message: 'You are already participating in the current pair!',
        code: DomainExceptionCode.Forbidden,
      });
    }

    const player = Player.create(Number(dto.userId));
    const savedPlayer = await this.playersRepository.save(player);

    foundGame.addSecondPlayer(savedPlayer.id);

    const randomQuestions = await this.questionsRepository.findFiveRandom();

    if (randomQuestions.length < 5) {
      throw new Error(
        'Cannot start the game — at least 5 questions are required',
      );
    }

    for (const question of randomQuestions) {
      const gameQuestion = GameQuestion.create({
        gameId: foundGame.id,
        questionId: question.id,
      });

      await this.gameQuestionRepository.save(gameQuestion);
    }

    foundGame.switchGameStatusToActiveAndStartGame();

    await this.gamesRepository.save(foundGame);

    return foundGame.id;
  }
}
