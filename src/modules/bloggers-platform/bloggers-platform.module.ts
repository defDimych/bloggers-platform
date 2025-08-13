import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { UpdateCommentLikeStatusUseCase } from './likes/application/usecases/comments/update-comment-like-status.usecase';
import {
  CommentLike,
  CommentLikeSchema,
} from './likes/domain/comment-like.entity';
import { CommentLikeRepository } from './likes/infrastructure/comment-like.repository';
import { CreateCommentLikeUseCase } from './likes/application/usecases/comments/create-comment-like.usecase';
import { UpdateCommentLikeCounterUseCase } from './likes/application/usecases/comments/update-comment-like-counter.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { TryExtractUserIdMiddleware } from './common/middleware/try-extract-user-id.middleware';
import { AuthModule } from '../auth/auth.module';
import { PostsService } from './posts/application/posts.service';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdatePostLikeStatusUseCase } from './likes/application/usecases/posts/update-post-like-status.usecase';
import { PostLike, PostLikeSchema } from './likes/domain/post-like.entity';
import { PostLikeRepository } from './likes/infrastructure/post-like.repository';
import { CreatePostLikeUseCase } from './likes/application/usecases/posts/create-post-like.usecase';
import { UpdatePostLikeCounterUseCase } from './likes/application/usecases/posts/update-post-like-counter.usecase';
import { SuperAdminBlogsController } from './blogs/api/super-admin-blogs.controller';

const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  UpdatePostLikeStatusUseCase,
  CreateCommentLikeUseCase,
  CreatePostLikeUseCase,
  UpdateCommentLikeCounterUseCase,
  UpdatePostLikeCounterUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];
const repository = [
  BlogsRepository,
  PostsRepository,
  CommentsRepository,
  CommentLikeRepository,
  PostLikeRepository,
];
const queryRepository = [
  BlogsQueryRepository,
  PostsQueryRepository,
  CommentsQueryRepository,
];

@Module({
  imports: [
    AuthModule,
    UserAccountsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
  ],
  controllers: [
    BlogsController,
    SuperAdminBlogsController,
    PostsController,
    CommentsController,
  ],
  providers: [...useCases, ...repository, ...queryRepository, PostsService],
})
export class BloggersPlatformModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TryExtractUserIdMiddleware)
      .forRoutes(
        { path: 'comments/*', method: RequestMethod.GET },
        { path: 'posts/*/comments', method: RequestMethod.GET },
        { path: 'posts/*', method: RequestMethod.GET },
        { path: 'posts', method: RequestMethod.GET },
        { path: 'blogs/*/posts', method: RequestMethod.GET },
      );
  }
}
