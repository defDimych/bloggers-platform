import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';

export class AuthTestHelper {
  constructor(private app: INestApplication) {}

  async login(data: {
    loginOrEmail: string;
    password: string;
  }): Promise<string> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send(data)
      .expect(HttpStatus.OK);

    const body = response.body as { accessToken: string };
    expect(typeof body.accessToken).toBe('string');
    // expect(response.headers['set-cookie']).toBe('string');

    return body.accessToken;
  }
}
