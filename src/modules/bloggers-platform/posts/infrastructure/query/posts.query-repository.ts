import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';
import { getPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/base.paginated.view-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
  async getPosts(
    query: getPostsQueryParams,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter = blogId ? { blogId, deletedAt: null } : { deletedAt: null };

    try {
      const posts = await this.PostModel.find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean();

      const totalCount = await this.PostModel.countDocuments(filter);

      const items = posts.map((post) => {
        return {
          id: post._id.toString(),
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt.toISOString(),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [
              {
                addedAt: new Date().toISOString(),
                userId: '123',
                login: 'Backend777',
              },
            ],
          },
        };
      });

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    } catch (error) {
      console.log(
        `POST query repository, getPosts : ${JSON.stringify(error, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findById(id: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({ _id: id });

    // TODO: Move to static method view-dto. Used default value
    return {
      id: post!._id.toString(),
      title: post!.title,
      shortDescription: post!.shortDescription,
      content: post!.content,
      blogId: post!.blogId,
      blogName: post!.blogName,
      createdAt: post!.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          {
            addedAt: new Date().toISOString(),
            userId: '123',
            login: 'Backend777',
          },
        ],
      },
    };
  }
}
