import { Injectable } from '@nestjs/common';
import { GamesRepository } from '../infrastructure/games.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Player } from '../entities/player.entity';
import { AnswerStatus } from '../common/answer-status.enum';
import { PlayersRepository } from '../infrastructure/players.repository';
import { GamesStatsService } from './games-stats.service';

@Injectable()
export class GamesService {
  constructor(
    private gamesRepository: GamesRepository,
    private playersRepository: PlayersRepository,
    private gamesStatsService: GamesStatsService,
  ) {}

  async validateGameAccess(dto: {
    gameId: number;
    userId: string;
  }): Promise<void> {
    const game = await this.gamesRepository.findByIdWithPairPlayers(dto.gameId);

    if (!game) {
      throw new DomainException({
        message: `Game by id: ${dto.gameId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    const userId = Number(dto.userId);

    // Получение id игроков, учавствующих в игре
    const participantIds = [game.firstPlayer.userId];

    if (game.secondPlayer) {
      participantIds.push(game.secondPlayer.userId);
    }

    // Проверка, что пользователь, который сделал запрос, является участником этой игры
    const isParticipant = participantIds.includes(userId);

    if (!isParticipant) {
      throw new DomainException({
        message: 'Sorry, you are not a participant in this game',
        code: DomainExceptionCode.Forbidden,
      });
    }
  }

  async processGameResult(dto: {
    currentPlayer: Player;
    opponentPlayer: Player;
  }): Promise<void> {
    const { currentPlayer, opponentPlayer } = dto;

    const hasCorrectAnswer = opponentPlayer.answers.some(
      (a) => a.status === AnswerStatus.Correct,
    );

    if (hasCorrectAnswer) {
      opponentPlayer.incrementScore();

      await this.playersRepository.updateScore({
        playerId: opponentPlayer.id,
        score: opponentPlayer.score,
      });
    }

    await this.gamesStatsService.recordStatistic({
      currentPlayer,
      opponentPlayer,
    });
  }
}
