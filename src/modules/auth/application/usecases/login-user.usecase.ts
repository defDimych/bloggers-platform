import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserDto } from '../../dto/login-user.dto';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionModelType } from '../../domain/session.entity';
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
    @InjectModel(Session.name) private SessionModel: SessionModelType,
    private jwtAuthService: JwtAdapter,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: LoginUserCommand) {
    const accessToken = this.jwtAuthService.createAccessToken(dto.userId);

    const deviceId: string = crypto.randomUUID();
    const refreshToken = this.jwtAuthService.createRefreshToken(
      dto.userId,
      deviceId,
    );

    const decodedPayload =
      this.jwtAuthService.getPayloadFromRefreshToken(refreshToken);

    const session = this.SessionModel.createInstance({
      userId: dto.userId,
      deviceId: decodedPayload.deviceId,
      deviceName: dto.deviceName,
      IP: dto.IP,
      iat: new Date(decodedPayload.iat),
      exp: new Date(decodedPayload.exp),
    });

    await this.sessionsRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }
}
