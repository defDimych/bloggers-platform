import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { CreateQuestionDto } from '../../src/modules/quiz-game/application/dto/create-question.dto';
import { QuestionsViewDto } from '../../src/modules/quiz-game/api/view-dto/questions.view-dto';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { fromUTF8ToBase64 } from '../helpers/encoder';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';
import { PublishedStatus } from '../../src/modules/quiz-game/api/input-dto/get-questions.query-params.input-dto';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { authBasic } from '../common/auth-basic';

export class QuestionsTestHelper {
  constructor(private app: INestApplication<App>) {}

  async createQuestion(data: CreateQuestionDto): Promise<QuestionsViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .set({
        Authorization:
          'Basic ' +
          fromUTF8ToBase64(
            BASIC_AUTH_CREDENTIALS.username,
            BASIC_AUTH_CREDENTIALS.password,
          ),
      })
      .send(data)
      .expect(HttpStatus.CREATED);

    const body = response.body as QuestionsViewDto;
    expect(typeof body.id).toBe('string');
    expect(body.body).toBe(data.body);
    expect(body.correctAnswers).toStrictEqual(data.correctAnswers);
    expect(body.published).toBe(false);
    expect(typeof body.createdAt).toBe('string');
    expect(typeof body.updatedAt).toBe('string');

    return body;
  }

  async getQuestions(query: {
    publishedStatus: PublishedStatus;
    bodySearchTerm?: string;
  }): Promise<PaginatedViewDto<QuestionsViewDto[]>> {
    const response = await request(this.app.getHttpServer())
      .get(`/${GLOBAL_PREFIX}/sa/quiz/questions`)
      .set(authBasic)
      .query(query)
      .expect(HttpStatus.OK);

    return response.body as PaginatedViewDto<QuestionsViewDto[]>;
  }
}
