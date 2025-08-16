import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class IdValidationTransformationPipe
  implements PipeTransform<string, number>
{
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val) || val < 1) {
      throw new DomainException({
        message: 'Validation failed',
        code: DomainExceptionCode.BadRequest,
      });
    }
    return val;
  }
}
