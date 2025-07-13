import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtendedErrorResponseBody } from './error-response-body.type';
import { DomainExceptionCode } from '../domain-exception-codes';
import { CoreConfig } from '../../core.config';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  constructor(private coreConfig: CoreConfig) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception.status === HttpStatus.TOO_MANY_REQUESTS) {
      response.sendStatus(exception.status);
      return;
    }

    const message =
      (exception.message as string) || 'Unknown exception occurred.';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ExtendedErrorResponseBody {
    if (!this.coreConfig.sendInternalServerErrorDetails) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        message: 'Some error occurred',
        extensions: [],
        code: DomainExceptionCode.InternalServerError,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message: message,
      extensions: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }
}
