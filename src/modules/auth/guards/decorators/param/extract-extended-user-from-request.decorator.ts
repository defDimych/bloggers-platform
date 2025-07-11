import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ExtendedUserContextDto } from '../../dto/extended-user-context.dto';

export const ExtractExtendedUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ExtendedUserContextDto => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user as ExtendedUserContextDto;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
