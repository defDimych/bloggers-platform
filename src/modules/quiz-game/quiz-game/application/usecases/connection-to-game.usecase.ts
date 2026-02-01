import { Command, CommandHandler } from '@nestjs/cqrs';
import { GamesRepository } from '../../infrastructure/games.repository';
import { Player } from '../../entities/player.entity';
import { Game } from '../../entities/game.entity';
import { PlayersRepository } from '../../infrastructure/players.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { QuestionsRepository } from '../../../infrastructure/questions.repository';
import { GameQuestion } from '../../entities/game-question.entity';
import { GameQuestionRepository } from '../../infrastructure/game-question.repository';
import { GAME_QUESTIONS_LIMIT } from '../../common/constants/game-questions-limit';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionalCommandHandler } from '../../../../../infrastructure/transactional-command-handler.abstract';

export class ConnectionToGameCommand extends Command<number> {
  constructor(public dto: { userId: string }) {
    super();
  }
}

@CommandHandler(ConnectionToGameCommand)
export class ConnectionToGameUseCase extends TransactionalCommandHandler<ConnectionToGameCommand> {
  constructor(
    dataSource: DataSource,
    private gamesRepository: GamesRepository,
    private playersRepository: PlayersRepository,
    private questionsRepository: QuestionsRepository,
    private gameQuestionRepository: GameQuestionRepository,
  ) {
    super(dataSource);
  }
  async handle(
    { dto }: ConnectionToGameCommand,
    entityManager: EntityManager,
  ): Promise<number> {
    const userId = Number(dto.userId);

    // 1) Проверяем существующую активную игру
    const activeGame = await this.gamesRepository.findActiveByUserId(
      userId,
      entityManager,
    );

    if (activeGame) {
      throw new DomainException({
        message: 'Sorry, you are already a member of an active couple!',
        code: DomainExceptionCode.Forbidden,
      });
    }

    // 2) Создание игрока
    const savedPlayer = await this.playersRepository.save(
      Player.create(userId),
      entityManager,
    );

    // 3) Поиск игры в ожидании второго игрока
    const pendingGame =
      await this.gamesRepository.findWithPendingSecondPlayer(entityManager);

    // 4.1) Если нет игры в статусе ожидания - создание игры с firstPlayer
    if (!pendingGame) {
      const newGame = await this.gamesRepository.save(
        Game.create(savedPlayer.id),
        entityManager,
      );

      return newGame.id;
    }

    // 4.2) Если есть, добавление второго игрока
    pendingGame.addSecondPlayer(savedPlayer.id);

    // 5) Загрузка пять рандомных вопросов
    const questions =
      await this.questionsRepository.findFiveRandom(entityManager);

    if (questions.length < GAME_QUESTIONS_LIMIT) {
      throw new Error(
        'Cannot start the game — at least 5 questions are required',
      );
    }

    // 6) Создание GameQuestions
    const promises: Promise<void>[] = questions.map((q) =>
      this.gameQuestionRepository.save(
        GameQuestion.create({
          gameId: pendingGame.id,
          questionId: q.id,
        }),
        entityManager,
      ),
    );

    await Promise.all(promises);

    // 7) Старт игры
    pendingGame.switchGameStatusToActiveAndStartGame();
    await this.gamesRepository.save(pendingGame, entityManager);

    return pendingGame.id;
  }
}
