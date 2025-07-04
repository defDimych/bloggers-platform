import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogsTestHelper } from './blogs.test-helper';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { fromUTF8ToBase64 } from '../helpers/encoder';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let blogsTestHelper: BlogsTestHelper;

  const createModel = {
    name: 'n1',
    description: 'd1',
    websiteUrl: 'https://somesite.com',
  };

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    blogsTestHelper = result.blogsTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('/blogs/:id (GET) should get blog by id, used additional methods: /blogs (POST)', async () => {
    const createdBlog = await blogsTestHelper.createBlog(createModel);

    await blogsTestHelper.getById(createdBlog.id);
  });

  it('/blogs/:id (PUT) should update blog, used additional methods: /blogs (POST), /blogs/:id (GET)', async () => {
    const createdBlog = await blogsTestHelper.createBlog(createModel);

    const updateModel = {
      name: 'n2',
      description: 'd2',
      websiteUrl: 'https://somesite.com',
    };

    await request(app.getHttpServer())
      .put(`/${GLOBAL_PREFIX}/blogs/${createdBlog.id}`)
      .set({
        Authorization:
          'Basic ' +
          fromUTF8ToBase64(
            BASIC_AUTH_CREDENTIALS.username,
            BASIC_AUTH_CREDENTIALS.password,
          ),
      })
      .send(updateModel)
      .expect(HttpStatus.NO_CONTENT);

    const response = await blogsTestHelper.getById(createdBlog.id);

    expect(response.name).toBe(updateModel.name);
    expect(response.description).toBe(updateModel.description);
    expect(response.websiteUrl).toBe(updateModel.websiteUrl);
  });

  it('/blogs/:id (DELETE) should delete blog by id, used additional methods: /blogs (POST), /blogs/:id (GET)', async () => {
    const createdBlog = await blogsTestHelper.createBlog(createModel);

    await blogsTestHelper.getById(createdBlog.id);

    await request(app.getHttpServer())
      .delete(`/${GLOBAL_PREFIX}/blogs/${createdBlog.id}`)
      .set({
        Authorization:
          'Basic ' +
          fromUTF8ToBase64(
            BASIC_AUTH_CREDENTIALS.username,
            BASIC_AUTH_CREDENTIALS.password,
          ),
      })
      .expect(HttpStatus.NO_CONTENT);

    await blogsTestHelper.getById(createdBlog.id, HttpStatus.NOT_FOUND);
  });
});
