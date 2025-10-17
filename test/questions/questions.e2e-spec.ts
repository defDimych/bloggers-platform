import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { initSettings } from '../helpers/init-settings';
import { QuestionsTestHelper } from './questions.test-helper';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { PublishedStatus } from '../../src/modules/quiz-game/api/input-dto/get-questions.query-params.input-dto';
import { authBasic } from '../common/auth-basic';

describe('QuestionsController (e2e)', () => {
  let app: INestApplication<App>;

  let questionsTestHelper: QuestionsTestHelper;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    questionsTestHelper = result.questionsTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  // beforeEach(async () => {
  //   await deleteAllData(app);
  // });

  const ids: string[] = [];
  it('should create 4 questions', async () => {
    for (let i = 0; i < 3; i++) {
      const createdQuestion = await questionsTestHelper.createQuestion({
        body: 'Сколько будет 2 + 2 ?',
        correctAnswers: ['4', 'четыре', 'for'],
      });

      ids.push(createdQuestion.id);
    }

    const createdQuestion = await questionsTestHelper.createQuestion({
      body: 'Вычислите сумму чисел 10 + 2',
      correctAnswers: ['12', 'двенадцать'],
    });

    ids.push(createdQuestion.id);
  });

  it('should delete question', async () => {
    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/quiz/questions/${ids[0]}`)
      .set(authBasic)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/sa/quiz/questions/${ids[0]}`)
      .set(authBasic)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should post a question', async () => {
    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/sa/quiz/questions/${ids[1]}/publish`)
      .set(authBasic)
      .send({ published: true })
      .expect(HttpStatus.NO_CONTENT);

    const response = await questionsTestHelper.getQuestions({
      publishedStatus: PublishedStatus.Published,
    });

    const foundQuestion = response.items.find((q) => q.id === ids[1]);

    expect(foundQuestion?.published).toBeTruthy();
  });

  it('should receive all undeleted, published/unpublished questions', async () => {
    const response = await questionsTestHelper.getQuestions({
      publishedStatus: PublishedStatus.All,
    });

    expect(response.items.length).toBe(3);
  });

  it('should receive question with bodySearchTerm and published', async () => {
    const response = await questionsTestHelper.getQuestions({
      publishedStatus: PublishedStatus.Published,
      bodySearchTerm: 'Сколько',
    });

    expect(response.items.length).toBe(1);
  });

  it('should receive unpublished questions', async () => {
    const response = await questionsTestHelper.getQuestions({
      publishedStatus: PublishedStatus.NotPublished,
    });

    expect(response.items.length).toBe(2);
  });
});
