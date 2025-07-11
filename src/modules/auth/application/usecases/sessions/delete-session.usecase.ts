import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteSessionCommand {
  constructor(public dto: { deviceId: string; userId: string }) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase
  implements ICommandHandler<DeleteSessionCommand, void>
{
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute({ dto }: DeleteSessionCommand): Promise<void> {
    const session = await this.sessionsRepository.findByDeviceId(dto.deviceId);

    if (!session) {
      throw new DomainException({
        message: `session by deviceId:${dto.deviceId} not found`,
        code: DomainExceptionCode.NotFound,
      });
    }

    if (session.userId !== dto.userId) {
      throw new DomainException({
        message: 'You do not have permission to delete this session',
        code: DomainExceptionCode.Forbidden,
      });
    }

    session.makeDeleted();

    await this.sessionsRepository.save(session);
  }
}
