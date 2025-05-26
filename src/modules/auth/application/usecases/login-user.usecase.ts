import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';

export class LoginUserCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(public dto: { userId: string }) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute({ dto }: LoginUserCommand) {
    const accessToken = this.accessTokenContext.sign({
      id: dto.userId,
    });
    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
