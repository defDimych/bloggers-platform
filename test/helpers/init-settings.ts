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
  appSetup(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const authTestHelper = new AuthTestHelper(app);
  const userTestHelper = new UsersTestHelper(app);
  const blogsTestHelper = new BlogsTestHelper(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    authTestHelper,
    userTestHelper,
    blogsTestHelper,
  };
};
