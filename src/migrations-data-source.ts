import { config } from 'dotenv';
import { envFilePaths } from './env-file-paths';
// must be called before any imports that might use process.env.
config({
  path: envFilePaths,
});

import { DataSource } from 'typeorm';
import { configValidationUtility } from './setup/config-validation.utility';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  synchronize: process.env.DB_AUTOSYNC
    ? (configValidationUtility.convertToBoolean(
        process.env.DB_AUTOSYNC,
      ) as boolean)
    : false,

  logging: process.env.DB_LOGGING_LEVEL
    ? (configValidationUtility.convertToBoolean(
        process.env.DB_LOGGING_LEVEL,
      ) as boolean)
    : false,

  migrations: [__dirname + '/migrations/*.ts'],
  entities: ['src/**/*.entity.ts'],
});
