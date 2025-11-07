import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../auth/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../auth/guards/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionToGameCommand } from '../application/usecases/connection-to-game.usecase';
import { GamesQueryRepository } from '../infrastructure/query/games.query-repository';
import { CustomParseUUIDPipe } from '../../../../core/pipes/custom-parse-uuid.pipe';
import { GamesService } from '../application/games.service';

@Controller('pair-game-quiz/pairs')
@UseGuards(JwtAuthGuard)
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gamesQueryRepository: GamesQueryRepository,
    private gamesService: GamesService,
  ) {}

  @Get(':id')
  async getGameById(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', CustomParseUUIDPipe) id: string,
  ) {
    await this.gamesService.validateGameAccess({
      gameId: id,
      userId: user.userId,
    });

    return this.gamesQueryRepository.findById({ id });
  }

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  async connectionToGame(@ExtractUserFromRequest() user: UserContextDto) {
    const gameId = await this.commandBus.execute(
      new ConnectionToGameCommand({
        userId: user.userId,
      }),
    );

    return this.gamesQueryRepository.findById({ id: gameId });
  }
}
