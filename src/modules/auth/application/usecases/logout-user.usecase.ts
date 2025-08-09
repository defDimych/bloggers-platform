import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../infrastructure/sessions.repository';

export class LogoutUserCommand {
  constructor(public readonly sessionId: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase
  implements ICommandHandler<LogoutUserCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ sessionId }: LogoutUserCommand): Promise<void> {
    await this.sessionsRepository.makeDeleted(Number(sessionId));
  }
}
