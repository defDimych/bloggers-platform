import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { Game } from '../../entities/game.entity';
import { GameViewDto } from '../../api/view-dto/games.view-dto';
import { GameStatus } from '../../common/game-status.enum';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findGame(dto: { id?: string; userId?: string }): Promise<GameViewDto> {
    const where: any[] = [];

    if (dto.id) {
      where.push({
        id: dto.id,
      });
    }

    if (dto.userId) {
      const userId = Number(dto.userId);

      where.push([
        {
          status: In([GameStatus.PendingSecondPlayer, GameStatus.Active]),
          firstPlayer: { userId },
        },
        {
          status: In([GameStatus.PendingSecondPlayer, GameStatus.Active]),
          secondPlayer: { userId },
        },
      ]);
    }

    const game = await this.dataSource.getRepository(Game).findOne({
      select: {
        id: true,
        status: true,
        createdAt: true,
        startedAt: true,
        finishedAt: true,
      },
      relations: {
        firstPlayer: {
          user: true,
          answers: true,
        },
        secondPlayer: {
          user: true,
          answers: true,
        },
        gameQuestions: {
          question: true,
        },
      },
      where,
      order: {
        firstPlayer: {
          answers: {
            createdAt: 'ASC',
          },
        },
        secondPlayer: {
          answers: {
            createdAt: 'ASC',
          },
        },
        gameQuestions: {
          id: 'ASC',
        },
      },
    });

    console.log(game);

    if (!game) {
      throw new DomainException({
        message: `Game not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return GameViewDto.mapToView(game);
  }
}
