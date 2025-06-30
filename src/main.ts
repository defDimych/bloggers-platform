import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app); //Global app settings.

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
  });
}
bootstrap();
