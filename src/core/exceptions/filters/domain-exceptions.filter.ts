import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { DomainException } from '../domain-exceptions';
import { Response } from 'express';
import { DomainExceptionCode } from '../domain-exception-codes';
import { ErrorResponseBody } from './error-response-body.type';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.code);

    if (
      exception.code === DomainExceptionCode.ValidationError ||
      exception.code === DomainExceptionCode.BadRequest
    ) {
      const responseBody = this.buildResponseBody(exception);

      response.status(status).json(responseBody);
    }

    response.sendStatus(status);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private buildResponseBody(exception: DomainException): ErrorResponseBody {
    const responseBody = {
      errorsMessages: [],
    } as ErrorResponseBody;

    exception.extensions.forEach((err) => {
      responseBody.errorsMessages.push({
        message: err.message,
        field: err.key,
      });
    });

    return responseBody;
  }
}
