import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestHelper } from './users.test-helper';
import request from 'supertest';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';
import { fromUTF8ToBase64 } from '../helpers/encoder';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userTestHelper: UsersTestHelper;

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    userTestHelper = result.userTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('delete user', () => {
    it('should delete user', async () => {
      const createdUser = await userTestHelper.createUser({
        login: 'Webster',
        password: 'Webster123',
        email: 'test@mail.ru',
      });

      await request(app.getHttpServer())
        .delete('/users/' + createdUser.id)
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
        .delete('/users/' + createdUser.id)
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

// it("/users (POST) shouldn't create user with incorrect input data", async () => {
//   const response = await request(app.getHttpServer())
//     .post('/users')
//     .set({ Authorization: 'Basic ' + fromUTF8ToBase64(username, password) })
//     .send({
//       login: '',
//       password: 123,
//       email: 'email',
//     })
//     .expect(400);
//
//   const body = response.body as ErrorResponse;
//   expect(body.errorsMessages[0].field).toBe('login');
//   expect(body.errorsMessages[1].field).toBe('password');
//   expect(body.errorsMessages[2].field).toBe('email');
// });
//
// it("shouldn't create a user if the login or email is not unique", async () => {
//   const response = await request(app.getHttpServer())
//     .post('/users')
//     .set({ Authorization: 'Basic ' + fromUTF8ToBase64(username, password) })
//     .send({
//       login: 'Webster',
//       password: 'Webster123',
//       email: 'Webster@mail.ru',
//     })
//     .expect(400);
//
//   const body = response.body as ErrorResponse;
//   expect(body.errorsMessages[0].field).toBe('login');
// });
