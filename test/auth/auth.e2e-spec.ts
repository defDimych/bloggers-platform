import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UsersTestHelper } from '../users/users.test-helper';
import request from 'supertest';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';
import { initApp } from '../helpers/init-settings';
import { TestingModuleBuilder } from '@nestjs/testing';
import { AuthConfig } from '../../src/modules/user-accounts/config/auth.config';
import { AuthTestHelper, createTestUserModel } from './auth.test-helper';
import { delay } from './delay';

describe('AuthController (e2e)', () => {
  describe('/auth/login (POST)', () => {
    let app: INestApplication<App>;

    let authTestHelper: AuthTestHelper;

    beforeAll(async () => {
      app = await initApp((builder: TestingModuleBuilder) => {
        builder.overrideProvider(AuthConfig).useValue({
          skipPasswordCheck: false,
          accessTokenSecret: 'secret',
          accessTokenExpireIn: '2s',
        });
      });

      const usersTestHelper: UsersTestHelper = new UsersTestHelper(app);
      authTestHelper = new AuthTestHelper(app);

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
      await authTestHelper.login();
    });
  });

  describe('/auth/me (GET)', () => {
    let app: INestApplication<App>;

    let accessToken: string;

    beforeAll(async () => {
      app = await initApp();

      const usersTestHelper: UsersTestHelper = new UsersTestHelper(app);
      const authTestHelper: AuthTestHelper = new AuthTestHelper(app);

      await usersTestHelper.createUser(createTestUserModel);
      accessToken = await authTestHelper.login();
    });

    afterAll(async () => {
      await app.close();
    });

    it('shouldn\'t return users info while "me" request if accessTokens expired', async () => {
      await delay(2000);
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
