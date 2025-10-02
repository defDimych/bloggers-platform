import { join } from 'path';

console.log(process.env.NODE_ENV);

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV is required');
}

export const envFilePaths = [
  process.env.ENV_FILE_PATH?.trim() || '',
  join(__dirname, `env`, `.env.${process.env.NODE_ENV}.local`),
  join(__dirname, `env`, `.env.${process.env.NODE_ENV}`),
  join(__dirname, `env`, `.env.production`),
];
