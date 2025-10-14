import { Module } from '@nestjs/common';
import { SuperAdminQuizQuestionsController } from './api/super-admin-quiz-questions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { CreateQuestionUseCase } from './application/usecases/create-question.usecase';
import { QuestionsQueryRepository } from './infrastructure/query/questions.query-repository';

@Module({
  imports: [TypeOrmModule.forFeature([Question])],
  controllers: [SuperAdminQuizQuestionsController],
  providers: [
    QuestionsRepository,
    QuestionsQueryRepository,
    CreateQuestionUseCase,
  ],
})
export class QuizGameModule {}
