import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../guards/bearer/jwt-refresh-auth.guard';
import { ExtractExtendedUserFromRequest } from '../guards/decorators/param/extract-extended-user-from-request.decorator';
import { ExtendedUserContextDto } from '../guards/dto/extended-user-context.dto';
import { SessionsViewDto } from './view-dto/sessions.view-dto';
import { SessionsQueryRepository } from '../infrastructure/query/sessions.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from '../application/usecases/sessions/delete-session.usecase';
import { DeleteSessionsExcludingCurrentCommand } from '../application/usecases/sessions/delete-sessions-excluding-current.usecase';

@Controller('security/devices')
@UseGuards(JwtRefreshAuthGuard)
export class SecurityDevicesController {
  constructor(
    private sessionsQueryRepository: SessionsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllActiveSessions(
    @ExtractExtendedUserFromRequest() user: ExtendedUserContextDto,
  ): Promise<SessionsViewDto[]> {
    return this.sessionsQueryRepository.getAll(Number(user.userId));
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('deviceId') deviceId: string,
    @ExtractExtendedUserFromRequest() user: ExtendedUserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteSessionCommand({ deviceId, userId: user.userId }),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllExcludingCurrent(
    @ExtractExtendedUserFromRequest() user: ExtendedUserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteSessionsExcludingCurrentCommand({
        userId: user.userId,
        deviceId: user.deviceId,
      }),
    );
  }
}
