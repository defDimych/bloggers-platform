import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../src/modules/user-accounts/dto/create-user.dto';
import request from 'supertest';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';
import { UsersViewDto } from '../../src/modules/user-accounts/api/view-dto/users.view-dto';
import { App } from 'supertest/types';

const fromUTF8ToBase64 = (username: string, password: string): string => {
  return Buffer.from(`${username}:${password}`).toString('base64');
};

export class UsersTestHelper {
  private readonly username: string = BASIC_AUTH_CREDENTIALS.username;
  private readonly password: string = BASIC_AUTH_CREDENTIALS.password;

  constructor(private app: INestApplication<App>) {}
  async createUser(data: CreateUserDto): Promise<UsersViewDto> {
    const response: request.Response = await request(this.app.getHttpServer())
      .post('/users')
      .set({
        Authorization:
          'Basic ' + fromUTF8ToBase64(this.username, this.password),
      })
      .send(data)
      .expect(201);

    const body = response.body as UsersViewDto;
    expect(body).toHaveProperty('id');
    expect(body.login).toBe(data.login);
    expect(body.email).toBe(data.email);
    expect(typeof body.createdAt).toBe('string');

    return body;
  }
}
