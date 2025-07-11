import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ExtendedUserContextDto } from '../dto/extended-user-context.dto';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwtRefresh') {
  handleRequest<TUser = ExtendedUserContextDto>(err, user: TUser) {
    if (err || !user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }
    return user;
  }
}
