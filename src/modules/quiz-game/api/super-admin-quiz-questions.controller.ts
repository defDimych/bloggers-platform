import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic/basic-auth.guard';
import { CreateQuestionDto } from '../application/dto/create-question.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { QuestionsViewDto } from './view-dto/questions.view-dto';
import { QuestionsQueryRepository } from '../infrastructure/query/questions.query-repository';
import { GetQuestionsQueryParams } from './input-dto/get-questions.query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CustomParseUUIDPipe } from '../../../core/pipes/custom-parse-uuid.pipe';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { PublishQuestionInputDto } from './input-dto/publish-question.input-dto';
import { PublishQuestionCommand } from '../application/usecases/publish-question.usecase';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
export class SuperAdminQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private questionsQueryRepository: QuestionsQueryRepository,
  ) {}

  @Get()
  async getQuestions(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionsViewDto[]>> {
    return this.questionsQueryRepository.findQuestions(query);
  }

  @Post()
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionsViewDto> {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(body),
    );

    return this.questionsQueryRepository.findQuestionById(questionId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id', CustomParseUUIDPipe) id: string,
    @Body() body: UpdateQuestionInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateQuestionCommand({
        id,
        body: body.body,
        correctAnswers: body.correctAnswers,
      }),
    );
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id', CustomParseUUIDPipe) id: string,
    @Body() body: PublishQuestionInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new PublishQuestionCommand({
        id,
        published: body.published,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
