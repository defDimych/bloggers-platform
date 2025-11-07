import { Injectable } from '@nestjs/common';
import { GamesRepository } from '../infrastructure/games.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class GamesService {
  constructor(private gamesRepository: GamesRepository) {}

  async validateGameAccess(dto: {
    gameId: string;
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
}
