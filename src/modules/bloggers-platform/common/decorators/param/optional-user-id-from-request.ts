import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OptionalUserIdFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const userId = request['userId'] as number | null;

    return userId;
  },
);
