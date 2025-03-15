import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}
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
