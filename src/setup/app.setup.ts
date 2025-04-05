import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { corsSetup } from './cors.setup';
import { filtersSetup } from './filters.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  corsSetup(app);
  filtersSetup(app);
}
