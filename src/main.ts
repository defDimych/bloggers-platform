import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';
import { initAppModule } from './init-app-module';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  // создаём на основе донастроенного модуля наше приложение
  const app = await NestFactory.create(DynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled); //Global app settings.

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
