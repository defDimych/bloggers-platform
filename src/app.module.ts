// import of this config module must be on the top of imports
import { configModule } from './dynamic-config.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    configModule,
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    BloggersPlatformModule,
    TestingModule,
    UserAccountsModule,
    AuthModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
