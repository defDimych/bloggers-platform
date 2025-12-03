import {
  Body,
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
import { GamesService } from '../application/games.service';
import { GameViewDto } from './view-dto/games.view-dto';
import { ProcessingAnswerCommand } from '../application/usecases/processing-answer.usecase';
import { AnswersQueryRepository } from '../infrastructure/query/answers.query-repository';
import { AnswersViewDto } from './view-dto/answers.view-dto';
import { IdValidationTransformationPipe } from '../../../../core/pipes/id-validation-transformation.pipe';

@Controller('pair-game-quiz/pairs')
@UseGuards(JwtAuthGuard)
export class PairQuizGameController {
  constructor(
    private commandBus: CommandBus,
    private gamesQueryRepository: GamesQueryRepository,
    private gamesService: GamesService,
    private answersQueryRepository: AnswersQueryRepository,
  ) {}

  @Get('my-current')
  async getGameInActiveOrPendingStatus(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameViewDto> {
    return this.gamesQueryRepository.findGame({
      userId: user.userId,
    });
  }

  @Get(':id')
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

  @Post('connection')
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

  @Post('my-current/answers')
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
