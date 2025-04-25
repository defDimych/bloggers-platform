import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UsersTestHelper } from '../users/users.test-helper';
import request from 'supertest';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';
import { initApp } from '../helpers/init-settings';
import { TestingModuleBuilder } from '@nestjs/testing';
import { AuthConfig } from '../../src/modules/user-accounts/config/auth.config';

describe('/auth/login (POST)', () => {
  let app: INestApplication<App>;

  let usersTestHelper: UsersTestHelper;

  const createTestUserModel = {
    login: 'Webster',
    password: 'Webster123',
    email: 'test@mail.ru',
  };

  beforeAll(async () => {
    app = await initApp((builder: TestingModuleBuilder) => {
      builder
        .overrideProvider(AuthConfig)
        .useValue({ skipPasswordCheck: false });
    });

    usersTestHelper = new UsersTestHelper(app);

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
