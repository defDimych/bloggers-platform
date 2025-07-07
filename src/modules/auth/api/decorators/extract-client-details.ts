import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ClientDetailsDto } from '../dto/client-details.dto';

export const ExtractClientDetails = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClientDetailsDto => {
    const request = ctx.switchToHttp().getRequest<Request>();

    return {
      IP: request.ip || '',
      deviceName: request.headers['user-agent'] || '',
    };
  },
);
