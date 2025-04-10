import { CreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/create-blog.dto';
import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { BlogViewDto } from '../../src/modules/bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { App } from 'supertest/types';

export class BlogsTestHelper {
  constructor(private app: INestApplication<App>) {}
  async getById(
    id: string,
    expectedStatusCode: number = HttpStatus.OK,
  ): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .get('/blogs/' + id)
      .expect(expectedStatusCode);

    return response.body as BlogViewDto;
  }

  async createBlog(data: CreateBlogDto): Promise<BlogViewDto> {
    const response = await request(this.app.getHttpServer())
      .post('/blogs')
      .send(data)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(data.name);
    expect(response.body.description).toBe(data.description);
    expect(response.body.websiteUrl).toBe(data.websiteUrl);

    return response.body as BlogViewDto;
  }
}
