import { Module } from '@nestjs/common';
import { SuperAdminQuizQuestionsController } from './api/super-admin-quiz-questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { QuestionsQueryRepository } from './infrastructure/query/questions.query-repository';
import { DeleteQuestionUseCase } from './application/usecases/delete-question.usecase';
import { UpdateQuestionUseCase } from './application/usecases/update-question.usecase';
import { PublishQuestionUseCase } from './application/usecases/publish-question.usecase';
import { PairQuizGameController } from './quiz-game/api/pair-quiz-game.controller';
import { ConnectionToGameUseCase } from './quiz-game/application/usecases/connection-to-game.usecase';
import { GamesRepository } from './quiz-game/infrastructure/games.repository';
import { Game } from './quiz-game/entities/game.entity';
import { Player } from './quiz-game/entities/player.entity';
import { GamesQueryRepository } from './quiz-game/infrastructure/query/games.query-repository';
import { PlayersRepository } from './quiz-game/infrastructure/players.repository';
import { GameQuestion } from './quiz-game/entities/game-question.entity';
import { GameQuestionRepository } from './quiz-game/infrastructure/game-question.repository';
import { GamesService } from './quiz-game/application/games.service';
import { Answer } from './quiz-game/entities/answer.entity';
import { ProcessingAnswerUseCase } from './quiz-game/application/usecases/processing-answer.usecase';
import { AnswersRepository } from './quiz-game/infrastructure/answers.repository';

const useCases = [
  ProcessingAnswerUseCase,
  ConnectionToGameUseCase,
  CreateQuestionUseCase,
  DeleteQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
];

const repositories = [
  AnswersRepository,
  QuestionsRepository,
  GamesRepository,
  PlayersRepository,
  GameQuestionRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Game, Player, GameQuestion, Answer]),
  ],
  controllers: [SuperAdminQuizQuestionsController, PairQuizGameController],
  providers: [
    ...useCases,
    ...repositories,
    QuestionsQueryRepository,
    GamesQueryRepository,
    GamesService,
  ],
})
export class QuizGameModule {}
