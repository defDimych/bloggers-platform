import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserContextDto } from '../dto/user-context.dto';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwFormattedErrors } from '../../../../setup/pipes.setup';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto> {
    const instance = plainToInstance(LoginInputDto, {
      loginOrEmail,
      password,
    });

    const errors = await validate(instance);

    if (errors.length > 0) {
      throwFormattedErrors(errors);
    }

    const user = await this.authService.validateUser(
      instance.loginOrEmail,
      instance.password,
    );

    if (!user) {
      throw new DomainException({
        message: 'Invalid login or password',
        code: DomainExceptionCode.Unauthorized,
      });
    }
    return user;
  }
}
