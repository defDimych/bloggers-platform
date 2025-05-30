import { HttpStatus, INestApplication } from '@nestjs/common';
import { initSettings } from '../helpers/init-settings';
import { deleteAllData } from '../helpers/delete-all-data';
import { BlogsTestHelper } from '../blogs/blogs.test-helper';
import { PostsTestHelper } from './posts.test-helper';
import request from 'supertest';
import { PostViewDto } from '../../src/modules/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { UsersTestHelper } from '../users/users.test-helper';
import { AuthTestHelper } from '../auth/auth.test-helper';
import { ErrorResponseBody } from '../../src/core/exceptions/filters/error-response-body.type';
import { CommentViewDto } from '../../src/modules/bloggers-platform/comments/api/view-dto/comments.view-dto';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let skipDeleteData = false;

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
    usersTestHelper = result.usersTestHelper;
    authTestHelper = result.authTestHelper;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    if (!skipDeleteData) {
      await deleteAllData(app);
    }
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

  describe('create comment', () => {
    let createdPost: PostViewDto;
    let accessToken: string;

    beforeAll(async () => {
      skipDeleteData = true;

      const createdBlog = await blogsTestHelper.createBlog(
        createTestingBlogModel,
      );

      createdPost = await postsTestHelper.createPost({
        title: 't1',
        shortDescription: 's1',
        content: 'c1',
        blogId: createdBlog.id,
      });

      const createTestingUserModel = {
        login: 'Webster',
        password: 'Webster123',
        email: 'test@mail.ru',
      };

      const createdUser = await usersTestHelper.createUser(
        createTestingUserModel,
      );

      accessToken = await authTestHelper.login({
        loginOrEmail: createdUser.login,
        password: createTestingUserModel.password,
      });
    });

    afterAll(() => {
      skipDeleteData = false;
    });

    it('should return 401 if the user is not authorized', async () => {
      await request(app.getHttpServer())
        .post('/posts/' + createdPost.id + '/comments')
        .send({ content: 'test content' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 if inputModel has incorrect values', async () => {
      const response = await request(app.getHttpServer())
        .post('/posts/' + createdPost.id + '/comments')
        .auth(accessToken, { type: 'bearer' })
        .send({ content: 'test content' })
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as ErrorResponseBody;
      expect(body.errorsMessages[0].field).toBe('content');
    });

    it('should create comment', async () => {
      const content = 'content_content_content_content';

      const response = await request(app.getHttpServer())
        .post('/posts/' + createdPost.id + '/comments')
        .auth(accessToken, { type: 'bearer' })
        .send({ content })
        .expect(HttpStatus.CREATED);

      const body = response.body as CommentViewDto;
      expect(body).toHaveProperty('id');
      expect(body.commentatorInfo.userId).not.toBe('');
      expect(body.commentatorInfo.userLogin).not.toBe('');
      expect(body.content).toBe(content);
      expect(body.likesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      });
    });
  });
});
