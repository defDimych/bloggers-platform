import { INestApplication } from '@nestjs/common';
import { corsSetup } from './cors.setup';
import { filtersSetup } from './filters.setup';
import { pipesSetup } from './pipes.setup';
import { cookieParserSetup } from './cookie-parser.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPrefixSetup } from './global-prefix.setup';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  corsSetup(app);
  filtersSetup(app);
  cookieParserSetup(app);
  swaggerSetup(app, isSwaggerEnabled);
  globalPrefixSetup(app);
}
