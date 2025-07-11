import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserContextDto } from '../../dto/user-context.dto';

export const ExtractUserFromRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserContextDto => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user as UserContextDto;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
