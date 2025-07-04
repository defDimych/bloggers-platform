import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { CreatePostDto } from '../../src/modules/bloggers-platform/posts/dto/create-post.dto';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { fromUTF8ToBase64 } from '../helpers/encoder';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';

export class PostsTestHelper {
  constructor(private app: INestApplication<App>) {}

  async createPost(data: CreatePostDto): Promise<PostViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(`/${GLOBAL_PREFIX}/posts`)
      .set({
        Authorization:
          'Basic ' +
          fromUTF8ToBase64(
            BASIC_AUTH_CREDENTIALS.username,
            BASIC_AUTH_CREDENTIALS.password,
          ),
      })
      .send(data)
      .expect(HttpStatus.CREATED);

    const body = response.body as PostViewDto;
    expect(body.title).toEqual(data.title);
    expect(body.shortDescription).toEqual(data.shortDescription);
    expect(body.content).toEqual(data.content);
    expect(body.blogId).toEqual(data.blogId);
    expect(typeof body.id).toEqual('string');
    expect(typeof body.blogName).toEqual('string');
    expect(typeof body.createdAt).toEqual('string');

    return body;
  }
}
