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

  let usersTestHelper: UsersTestHelper;

  const createTestUserModel = {
    login: 'Webster',
    password: 'Webster123',
    email: 'test@mail.ru',
  };

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

    await usersTestHelper.createUser(createTestUserModel);
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

  it('should return 401 for the incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createTestUserModel.login,
        password: '123',
      })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should return 200 and accessToken in body for valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createTestUserModel.login,
        password: createTestUserModel.password,
      })
      .expect(HttpStatus.OK);

    const body = response.body as { accessToken: string };
    expect(typeof body.accessToken).toBe('string');
  });
});
