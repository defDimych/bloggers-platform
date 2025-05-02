import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';

export const createTestUserModel = {
  login: 'Webster',
  password: 'Webster123',
  email: 'test@mail.ru',
};

export class AuthTestHelper {
  constructor(private app: INestApplication<App>) {}

  async login(): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: createTestUserModel.login,
        password: createTestUserModel.password,
      })
      .expect(HttpStatus.OK);

    const body = response.body as { accessToken: string };
    expect(typeof body.accessToken).toBe('string');

    return body.accessToken;
  }
}
