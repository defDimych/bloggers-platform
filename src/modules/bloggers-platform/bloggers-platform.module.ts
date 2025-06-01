import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentsController } from './comments/api/comments.controller';
import { UpdateLikeStatusUseCase } from './comments/application/usecases/update-like-status.usecase';
import {
  CommentLike,
  CommentLikeSchema,
} from './likes/domain/comment-like.entity';
import { CommentLikeRepository } from './likes/infrastructure/comment-like.repository';
import { CreateLikeUseCase } from './comments/application/usecases/create-like.usecase';
import { UpdateLikesCountUseCase } from './comments/application/usecases/update-likes-count.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  UpdateLikeStatusUseCase,
  CreateLikeUseCase,
  UpdateLikesCountUseCase,
  UpdateCommentUseCase,
];
const repository = [
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  CommentLikeRepository,
];
const queryRepository = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];

@Module({
  imports: [
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [...useCases, ...repository, ...queryRepository],
})
export class BloggersPlatformModule {}
