import { INestApplication } from '@nestjs/common';
import { corsSetup } from './cors.setup';
import { filtersSetup } from './filters.setup';
import { pipesSetup } from './pipes.setup';
import { cookieParserSetup } from './cookie-parser.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  corsSetup(app);
  filtersSetup(app);
  cookieParserSetup(app);
}
