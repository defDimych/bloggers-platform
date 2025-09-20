import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class CustomParseUUIDPipe
  extends ParseUUIDPipe
  implements PipeTransform
{
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw new DomainException({
          code: DomainExceptionCode.NotFound,
          message: 'Validation failed',
        });
      }
      throw e;
    }
  }
}
