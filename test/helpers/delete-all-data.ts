import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';

export const deleteAllData = (app: INestApplication) => {
  return request(app.getHttpServer()).delete(
    `/${GLOBAL_PREFIX}/testing/all-data`,
  );
};
