import { Extension } from '../domain-exceptions';
import { DomainExceptionCode } from '../domain-exception-codes';

type ErrorInfo = {
  message: string;
  field: string;
};

export type ErrorResponseBody = {
  errorsMessages: ErrorInfo[];
};

export type ExtendedErrorResponseBody = {
  timestamp: string;
  path: string | null;
  message: string;
  extensions: Extension[];
  code: DomainExceptionCode;
};
