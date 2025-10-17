import { fromUTF8ToBase64 } from '../helpers/encoder';
import { BASIC_AUTH_CREDENTIALS } from '../../src/constants';

export const authBasic = {
  Authorization:
    'Basic ' +
    fromUTF8ToBase64(
      BASIC_AUTH_CREDENTIALS.username,
      BASIC_AUTH_CREDENTIALS.password,
    ),
};
