// import of this config module must be on the top of imports
import { configModule } from './dynamic-config.module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';

@Module({
  imports: [
    CqrsModule.forRoot(),
    configModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('DB_URI', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    AuthModule,
    BloggersPlatformModule,
    UserAccountsModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env , потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
