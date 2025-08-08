import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

export class DeleteSessionsExcludingCurrentCommand {
  constructor(public dto: { userId: string; deviceId: string }) {}
}

@CommandHandler(DeleteSessionsExcludingCurrentCommand)
export class DeleteSessionsExcludingCurrentUseCase
  implements ICommandHandler<DeleteSessionsExcludingCurrentCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: DeleteSessionsExcludingCurrentCommand): Promise<void> {
    await this.sessionsRepository.makeDeletedAllUserSessionsExcludingCurrentOne(
      {
        deviceId: dto.deviceId,
        userId: Number(dto.userId),
      },
    );
  }
}
