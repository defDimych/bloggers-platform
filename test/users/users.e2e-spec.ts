import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestHelper } from './users.test-helper';
import request from 'supertest';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';
import { fromUTF8ToBase64 } from '../helpers/encoder';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { App } from 'supertest/types';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';

describe('SuperAdminUsersController (e2e)', () => {
  let app: INestApplication<App>;
  let userTestHelper: UsersTestHelper;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    userTestHelper = result.usersTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('create user', () => {
    it('should create user', async () => {
      await userTestHelper.createUser({
        login: 'Webster',
        password: 'Webster123',
        email: 'test@mail.ru',
      });
    });

    it('should return 400 if email is not unique', async () => {
      await userTestHelper.createUser({
        login: 'Webster',
        password: 'Webster123',
        email: 'test@mail.ru',
      });

      const response = await request(app.getHttpServer())
        .post(`/${GLOBAL_PREFIX}/sa/users`)
        .set({
          Authorization:
            'Basic ' +
            fromUTF8ToBase64(
              BASIC_AUTH_CREDENTIALS.username,
              BASIC_AUTH_CREDENTIALS.password,
            ),
        })
        .send({
          login: 'Teacher',
          password: 'Webster123',
          email: 'test@mail.ru',
        })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as ErrorResponseBody;

      expect(body.errorsMessages[0].field).toBe('email');
    });
  });

  describe('delete user', () => {
    it('should delete user', async () => {
      const createdUser = await userTestHelper.createUser({
        login: 'Webster',
        password: 'Webster123',
        email: 'test@mail.ru',
      });

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/sa/users/${createdUser.id}`)
        .set({
          Authorization:
            'Basic ' +
            fromUTF8ToBase64(
              BASIC_AUTH_CREDENTIALS.username,
              BASIC_AUTH_CREDENTIALS.password,
            ),
        })
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .delete(`/${GLOBAL_PREFIX}/sa/users/${createdUser.id}`)
        .set({
          Authorization:
            'Basic ' +
            fromUTF8ToBase64(
              BASIC_AUTH_CREDENTIALS.username,
              BASIC_AUTH_CREDENTIALS.password,
            ),
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
