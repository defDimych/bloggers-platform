import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';
import { throwFormattedErrors } from '../../../../setup/pipes.setup';
import { validate } from 'class-validator';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const { loginOrEmail, password } = request.body as LoginInputDto;

    const instance = plainToInstance(LoginInputDto, {
      loginOrEmail,
      password,
    });

    const errors = await validate(instance);

    if (errors.length > 0) {
      throwFormattedErrors(errors);
    }

    return super.canActivate(context) as boolean;
  }
}
