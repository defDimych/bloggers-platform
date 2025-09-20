import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class LogoutUserCommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ deviceId }: LogoutUserCommand): Promise<void> {
    await this.sessionsRepository.makeDeleted(deviceId);
  }
}
