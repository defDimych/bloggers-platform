import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { AuthTestHelper } from './auth.test-helper';
import { deleteAllData } from '../helpers/delete-all-data';
import { UsersTestHelper } from '../users/users.test-helper';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../../src/modules/auth/constants/auth-tokens.inject-constants';
import { AuthConfig } from '../../src/modules/auth/config/auth.config';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';
import { MeViewDto } from '../../src/modules/user-accounts/api/view-dto/users.view-dto';
import { delay } from './delay';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let userTestHelper: UsersTestHelper;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (authConfig: AuthConfig) => {
            return new JwtService({
              secret: authConfig.accessTokenSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [AuthConfig],
        });
    });

    app = result.app;
    authTestHelper = result.authTestHelper;
    userTestHelper = result.usersTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  const createTestingUserModel = {
    login: 'Webster',
    password: 'Webster123',
    email: 'test@mail.ru',
  };

  describe('login (POST)', () => {
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

    it.skip('should return 401 for the incorrect credentials', async () => {
      const createdUser = await userTestHelper.createUser(
        createTestingUserModel,
      );

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: createdUser.login,
          password: '123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 200 and accessToken in body for valid credentials', async () => {
      const createdUser = await userTestHelper.createUser(
        createTestingUserModel,
      );
      await authTestHelper.login({
        loginOrEmail: createdUser.login,
        password: createTestingUserModel.password,
      });
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return user info while "me" request if accessToken valid', async () => {
      const createdUser = await userTestHelper.createUser(
        createTestingUserModel,
      );
      const accessToken = await authTestHelper.login({
        loginOrEmail: createdUser.login,
        password: createTestingUserModel.password,
      });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      const body = response.body as MeViewDto;
      expect(body).toHaveProperty('userId');
      expect(body.login).toBe(createdUser.login);
      expect(body.email).toBe(createdUser.email);
    });

    it('shouldn\'t return users info while "me" request if accessTokens expired', async () => {
      const createdUser = await userTestHelper.createUser(
        createTestingUserModel,
      );
      const accessToken = await authTestHelper.login({
        loginOrEmail: createdUser.login,
        password: createTestingUserModel.password,
      });

      await delay(2000);
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(accessToken, { type: 'bearer' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
