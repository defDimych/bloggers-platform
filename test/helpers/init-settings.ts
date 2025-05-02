import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AuthConfig } from '../../src/modules/user-accounts/config/auth.config';
import { INestApplication } from '@nestjs/common';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { App } from 'supertest/types';

export const initApp = async (
  customBuilderSetup = (builder: TestingModuleBuilder) => {},
) => {
  const testingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(AuthConfig)
    .useValue({
      skipPasswordCheck: true,
      accessTokenSecret: 'secret',
      accessTokenExpireIn: '2s',
    });

  customBuilderSetup(testingModuleBuilder);

  const moduleFixture: TestingModule = await testingModuleBuilder.compile();

  const app: INestApplication<App> = moduleFixture.createNestApplication();

  appSetup(app);

  await app.init();

  await clearDB(moduleFixture);

  return app;
};

const clearDB = async (moduleFixture: TestingModule) => {
  // Получаем подключение к бд
  const connection = moduleFixture.get<Connection>(getConnectionToken());

  // Очистка всех коллекций в тестовой бд
  const collections = await connection.db!.listCollections().toArray();
  for (const collection of collections) {
    await connection.db!.collection(collection.name).deleteMany({});
  }
};
