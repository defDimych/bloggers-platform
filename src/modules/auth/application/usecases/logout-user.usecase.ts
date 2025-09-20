import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class LogoutUserCommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ deviceId }: LogoutUserCommand): Promise<void> {
    const session =
      await this.sessionsRepository.findSessionByDeviceId(deviceId);

    if (!session) {
      throw new DomainException({
        message: `session by deviceId:${deviceId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    session.makeDeleted();

    await this.sessionsRepository.save(session);
  }
}
