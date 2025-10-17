import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { appSetup } from '../../src/setup/app.setup';
import { AuthTestHelper } from '../auth/auth.test-helper';
import { deleteAllData } from './delete-all-data';
import { UsersTestHelper } from '../users/users.test-helper';
import { BlogsTestHelper } from '../blogs/blogs.test-helper';
import { PostsTestHelper } from '../posts/posts.test-helper';
import { CoreConfig } from '../../src/core/core.config';
import { initAppModule } from '../../src/init-app-module';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { QuestionsTestHelper } from '../questions/questions.test-helper';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication<INestApplication<App>>();
  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.init();

  // const databaseConnection = app.get<Connection>(getConnectionToken());
  const authTestHelper = new AuthTestHelper(app);
  const usersTestHelper = new UsersTestHelper(app);
  const blogsTestHelper = new BlogsTestHelper(app);
  const postsTestHelper = new PostsTestHelper(app);
  const questionsTestHelper = new QuestionsTestHelper(app);

  await deleteAllData(app);

  return {
    app,
    authTestHelper,
    usersTestHelper,
    blogsTestHelper,
    postsTestHelper,
    questionsTestHelper,
  };
};
