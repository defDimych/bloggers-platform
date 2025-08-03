import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserDto } from '../../dto/login-user.dto';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class LoginUserCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(public dto: LoginUserDto) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private jwtAdapter: JwtAdapter,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: LoginUserCommand) {
    const accessToken = this.jwtAdapter.createAccessToken(dto.userId);

    const deviceId: string = crypto.randomUUID();
    const refreshToken = this.jwtAdapter.createRefreshToken(
      dto.userId,
      deviceId,
    );

    const decodedPayload =
      this.jwtAdapter.getPayloadFromRefreshToken(refreshToken);

    await this.sessionsRepository.createSession({
      userId: Number(dto.userId),
      deviceId: decodedPayload.deviceId,
      deviceName: dto.deviceName,
      IP: dto.IP,
      iat: new Date(decodedPayload.iat * 1000),
      exp: new Date(decodedPayload.exp * 1000),
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
