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
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { UsersViewDto } from '../../src/modules/user-accounts/api/view-dto/users.view-dto';
import { UsersSortBy } from '../../src/modules/user-accounts/api/input-dto/get-users.query-params.input-dto';

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

  afterEach(async () => {
    await deleteAllData(app);
  });

  describe('get all users with pagination', () => {
    it('should return all users with sorting and pagination', async () => {
      const n = 20;
      for (let i = 1; i <= n; i++) {
        await userTestHelper.createUser({
          login: `user${i}`,
          password: 'Webster123',
          email: `test${i}@mail.ru`,
        });
      }

      const response = await request(app.getHttpServer())
        .get(`/${GLOBAL_PREFIX}/sa/users`)
        .query({
          sortBy: UsersSortBy.CreatedAt,
        })
        .set({
          Authorization:
            'Basic ' +
            fromUTF8ToBase64(
              BASIC_AUTH_CREDENTIALS.username,
              BASIC_AUTH_CREDENTIALS.password,
            ),
        })
        .expect(HttpStatus.OK);

      const body = response.body as PaginatedViewDto<UsersViewDto[]>;

      expect(body.totalCount).toBe(n);
      expect(body.pagesCount).toBe(2);
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(10);

      for (const item of body.items) {
        const seq = Array.from({ length: 10 }, (value, index) => 11 + index);
        const number = Number(item.login.replace(/\D/g, ''));

        expect(seq.includes(number)).toBeTruthy();
      }
    });
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
