import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic/basic-auth.guard';
import { CreateQuestionDto } from '../application/dto/create-question.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionsViewDto } from './view-dto/questions.view-dto';
import { QuestionsQueryRepository } from '../infrastructure/query/questions.query-repository';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SuperAdminQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}
  @Post()
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionsViewDto> {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(body),
    );

    return this.questionsQueryRepository.findQuestionById(questionId);
  }
}
