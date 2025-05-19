import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogsTestHelper } from './blogs.test-helper';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';

describe('BlogsController (e2e)', () => {
  let app: INestApplication;
  let blogsTestHelper: BlogsTestHelper;

  const createModel = {
    name: 'n1',
    description: 'd1',
    websiteUrl: 'http://somesite.com',
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
