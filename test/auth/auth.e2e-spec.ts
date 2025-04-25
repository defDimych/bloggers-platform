import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthConfig } from '../../src/modules/user-accounts/config/auth.config';
import { UsersTestHelper } from '../users/users.test-helper';
import { pipesSetup } from '../../src/setup/pipes.setup';
import { filtersSetup } from '../../src/setup/filters.setup';
import request from 'supertest';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';

describe('/auth/login (POST)', () => {
  let app: INestApplication<App>;
  let connection: Connection;

  // let testUser: UsersViewDto;
  let usersTestHelper: UsersTestHelper;

  beforeAll(async () => {
    const testingModuleBuilder = Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthConfig)
      .useValue({ skipPasswordCheck: false });

    const moduleFixture: TestingModule = await testingModuleBuilder.compile();

    app = moduleFixture.createNestApplication();

    // Подключение глобального пайпа, для эмуляции реальных HTTP-запросов
    pipesSetup(app);
    filtersSetup(app);

    await app.init();

    usersTestHelper = new UsersTestHelper(app);

    // Получаем подключение к бд
    connection = moduleFixture.get<Connection>(getConnectionToken());

    // Очистка всех коллекций в тестовой бд
    const collections = await connection.db!.listCollections().toArray();
    for (const collection of collections) {
      await connection.db!.collection(collection.name).deleteMany({});
    }

    await usersTestHelper.createUser({
      login: 'Webster',
      password: 'Webster123',
      email: 'test@mail.ru',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 if inputModel has incorrect values', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: '',
        password: 123,
      })
      .expect(HttpStatus.BAD_REQUEST);

    const body = response.body as ErrorResponseBody;
    expect(body.errorsMessages[0].field).toBe('loginOrEmail');
    expect(body.errorsMessages[1].field).toBe('password');
  });
});
