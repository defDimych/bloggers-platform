// import of this config module must be on the top of imports
import { configModule } from './dynamic-config.module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    CqrsModule.forRoot(),
    configModule,
    ThrottlerModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => [
        {
          ttl: coreConfig.THROTTLE_TTL,
          limit: coreConfig.THROTTLE_LIMIT,
        },
      ],
      inject: [CoreConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => ({
        type: 'postgres',
        host: coreConfig.postgresHost,
        port: coreConfig.postgresPort,
        username: coreConfig.postgresUserName,
        password: coreConfig.postgresPassword,
        database: coreConfig.postgresDatabase,
        autoLoadEntities: true, // Автоподгрузка сущностей
        synchronize: true, // Автоматическое обновление схемы БД (только для разработки!)
      }),
      inject: [CoreConfig],
    }),
    AuthModule,
    BloggersPlatformModule,
    UserAccountsModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: 'APP_FILTER',
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}

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
