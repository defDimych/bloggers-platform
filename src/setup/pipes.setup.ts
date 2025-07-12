import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';
import { ValidationError } from 'class-validator';

export const throwFormattedErrors = (
  errors: ValidationError[],
  errorMessage?: Extension[] | [],
): Extension[] => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error?.constraints && error?.children?.length) {
      throwFormattedErrors(error.children, errorsForResponse);
    } else if (error?.constraints) {
      const constraintKeys = Object.keys(error.constraints);

      for (const key of constraintKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          key: error.property,
        });
      }
    }
  }

  throw new DomainException({
    message: 'Validation failed',
    code: DomainExceptionCode.ValidationError,
    extensions: errorsForResponse,
  });
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      validateCustomDecorators: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        throwFormattedErrors(errors);
      },
    }),
  );
}
