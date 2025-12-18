import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../auth/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../../auth/guards/dto/user-context.dto';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectionToGameCommand } from '../application/usecases/connection-to-game.usecase';
import { GamesQueryRepository } from '../infrastructure/query/games.query-repository';
import { GamesService } from '../application/games.service';
import { GameViewDto } from './view-dto/games.view-dto';
import { ProcessingAnswerCommand } from '../application/usecases/processing-answer.usecase';
import { AnswersQueryRepository } from '../infrastructure/query/answers.query-repository';
import { AnswersViewDto } from './view-dto/answers.view-dto';
import { IdValidationTransformationPipe } from '../../../../core/pipes/id-validation-transformation.pipe';
import { GetGamesQueryParams } from './input-dto/get-games-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GamesStatsQueryRepository } from '../infrastructure/query/games-stats.query-repository';
import { GamesStatsViewDto } from './view-dto/games-stats.view-dto';
import { Public } from '../../../auth/guards/decorators/public.decorator';
import { GetUsersTopQueryParams } from './input-dto/get-users-top-query-params.input-dto';

@Controller('pair-game-quiz')
@UseGuards(JwtAuthGuard)
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gamesQueryRepository: GamesQueryRepository,
    private gamesService: GamesService,
    private answersQueryRepository: AnswersQueryRepository,
    private gamesStatsQueryRepository: GamesStatsQueryRepository,
  ) {}

  @Get('pairs/my')
  async getAll(
    @ExtractUserFromRequest() user: UserContextDto,
    @Query() query: GetGamesQueryParams,
  ): Promise<PaginatedViewDto<GameViewDto[]>> {
    return this.gamesQueryRepository.findAll({
      queryParams: query,
      userId: user.userId,
    });
  }

  @Public()
  @Get('users/top')
  async getUsersTop(
    @Query() query: GetUsersTopQueryParams,
  ): Promise<PaginatedViewDto<GamesStatsViewDto[]>> {
    return this.gamesStatsQueryRepository.getUsersTop(query);
  }

  @Get('users/my-statistic')
  async getStatistic(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GamesStatsViewDto> {
    return this.gamesStatsQueryRepository.getMyStatistic({
      userId: user.userId,
    });
  }

  @Get('pairs/my-current')
  async getGameInActiveOrPendingStatus(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.gamesQueryRepository.findGame({
      userId: user.userId,
    });
  }

  @Get('pairs/:id')
  async getGameInAnyStatus(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', IdValidationTransformationPipe) id: number,
  ): Promise<GameViewDto> {
    await this.gamesService.validateGameAccess({
      gameId: id,
      userId: user.userId,
    });

    return this.gamesQueryRepository.findGame({ id });
  }

  @Post('pairs/connection')
  @HttpCode(HttpStatus.OK)
  async connectionToGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    const gameId = await this.commandBus.execute(
      new ConnectionToGameCommand({
        userId: user.userId,
      }),
    );

    return this.gamesQueryRepository.findGame({ id: gameId });
  }

  @Post('pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  async processingAnswer(
    @Body('answer') answer: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<AnswersViewDto> {
    const answerId = await this.commandBus.execute(
      new ProcessingAnswerCommand({
        answer,
        userId: user.userId,
      }),
    );

    return this.answersQueryRepository.findById(answerId);
  }
}
