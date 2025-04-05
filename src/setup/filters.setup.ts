import { INestApplication } from '@nestjs/common';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exceptions.filter';

export function filtersSetup(app: INestApplication) {
  app.useGlobalFilters(new DomainHttpExceptionsFilter());
}
