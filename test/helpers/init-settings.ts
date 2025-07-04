import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AuthTestHelper } from '../auth/auth.test-helper';
import { deleteAllData } from './delete-all-data';
import { UsersTestHelper } from '../users/users.test-helper';
import { BlogsTestHelper } from '../blogs/blogs.test-helper';
import { PostsTestHelper } from '../posts/posts.test-helper';
import { CoreConfig } from '../../src/core/core.config';

export const initSettings = async (
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const authTestHelper = new AuthTestHelper(app);
  const usersTestHelper = new UsersTestHelper(app);
  const blogsTestHelper = new BlogsTestHelper(app);
  const postsTestHelper = new PostsTestHelper(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    authTestHelper,
    usersTestHelper,
    blogsTestHelper,
    postsTestHelper,
  };
};
