import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { BlogsTestHelper } from './blogs.test-helper';
import { initApp } from '../helpers/init-settings';

describe('BlogsController (e2e)', () => {
  let app: INestApplication<App>;

  let blogsTestHelper: BlogsTestHelper;

  const createModel = {
    name: 'n1',
    description: 'd1',
    websiteUrl: 'http://somesite.com',
  };

  beforeAll(async () => {
    app = await initApp();

    blogsTestHelper = new BlogsTestHelper(app);
  });

  afterAll(async () => {
    await app.close();
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
      websiteUrl: 'http://somesite.com',
    };

    await request(app.getHttpServer())
      .put('/blogs/' + createdBlog.id)
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
      .delete('/blogs/' + createdBlog.id)
      .expect(HttpStatus.NO_CONTENT);

    await blogsTestHelper.getById(createdBlog.id, HttpStatus.NOT_FOUND);
  });
});
