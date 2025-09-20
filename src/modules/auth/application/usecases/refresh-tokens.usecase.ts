import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExtendedUserContextDto } from '../../guards/dto/extended-user-context.dto';
import { JwtAdapter } from '../../infrastructure/jwt.adapter';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class RefreshTokensCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(public dto: ExtendedUserContextDto) {
    super();
  }
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase
  implements ICommandHandler<RefreshTokensCommand>
{
  constructor(
    private jwtAdapter: JwtAdapter,
    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: RefreshTokensCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.jwtAdapter.createAccessToken(dto.userId);
    const refreshToken = this.jwtAdapter.createRefreshToken(
      dto.userId,
      dto.deviceId,
    );

    const decodedPayload =
      this.jwtAdapter.getPayloadFromRefreshToken(refreshToken);

    const session = await this.sessionsRepository.findSessionByDeviceId(
      dto.deviceId,
    );

    const newIssueDate = new Date(decodedPayload.iat * 1000);
    session!.updateIssueDate(newIssueDate);

    await this.sessionsRepository.save(session!);

    return {
      accessToken,
      refreshToken,
    };
  }
}
