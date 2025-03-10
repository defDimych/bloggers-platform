import { CreateBlogDto } from '../dto/create-blog.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog: BlogDocument = this.BlogModel.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog._id.toString();
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
