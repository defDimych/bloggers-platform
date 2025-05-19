import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { BlogsTestHelper } from '../blogs/blogs.test-helper';
import { PostsTestHelper } from './posts.test-helper';
import request from 'supertest';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;

  const createTestingBlogModel = {
    name: 'n1',
    description: 'd1',
    websiteUrl: 'https://it-incubator.io/en',
  };

  beforeAll(async () => {
    const result = await initSettings();

    app = result.app;
    blogsTestHelper = result.blogsTestHelper;
    postsTestHelper = result.postsTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('create post', async () => {
    const createdBlog = await blogsTestHelper.createBlog(
      createTestingBlogModel,
    );

    await postsTestHelper.createPost({
      title: 't1',
      shortDescription: 's1',
      content: 'c1',
      blogId: createdBlog.id,
    });
  });

  it('update post', async () => {
    const createdBlog = await blogsTestHelper.createBlog(
      createTestingBlogModel,
    );

    const createdPost = await postsTestHelper.createPost({
      title: 't1',
      shortDescription: 's1',
      content: 'c1',
      blogId: createdBlog.id,
    });

    const dataForUpdate = {
      title: 't2',
      shortDescription: 's2',
      content: 'c2',
      blogId: createdPost.blogId,
    };

    await request(app.getHttpServer())
      .put('/posts/' + createdPost.id)
      .send(dataForUpdate)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get('/posts/' + createdPost.id)
      .expect(HttpStatus.OK);

    const body = response.body as PostViewDto;
    expect(body.title).toBe(dataForUpdate.title);
    expect(body.shortDescription).toBe(dataForUpdate.shortDescription);
    expect(body.content).toBe(dataForUpdate.content);
  });

  it('delete post', async () => {
    const createdBlog = await blogsTestHelper.createBlog(
      createTestingBlogModel,
    );

    const createdPost = await postsTestHelper.createPost({
      title: 't1',
      shortDescription: 's1',
      content: 'c1',
      blogId: createdBlog.id,
    });

    await request(app.getHttpServer())
      .delete('/posts/' + createdPost.id)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get('/posts/' + createdPost.id)
      .expect(HttpStatus.NOT_FOUND);
  });
});
