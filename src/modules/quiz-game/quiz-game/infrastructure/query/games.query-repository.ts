import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, SelectQueryBuilder } from 'typeorm';
import { Game } from '../../entities/game.entity';
import { GameViewDto } from '../../api/view-dto/games.view-dto';
import { GameStatus } from '../../common/game-status.enum';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import {
  GamesSortBy,
  GetGamesQueryParams,
} from '../../api/input-dto/get-games-query-params.input-dto';
import { Answer } from '../../entities/answer.entity';
import { GameQuestion } from '../../entities/game-question.entity';
import { GameRawType } from './game-raw.type';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  // TODO: Исключить дублирование подзапросов answers
  async findAll(dto: {
    queryParams: GetGamesQueryParams;
    userId: string;
  }): Promise<PaginatedViewDto<GameViewDto[]>> {
    const userId = Number(dto.userId);

    try {
      const builder = this.dataSource
        .getRepository(Game)
        .createQueryBuilder('g')
        .select([
          'g.id as "gameId"',
          'g.status as "gameStatus"',
          'g.createdAt as "createdAt"',
          'g.startedAt as "startedAt"',
          'g.finishedAt as "finishedAt"',
        ])
        // Краткая инфа первого игрока, и его ответы
        .innerJoin('g.firstPlayer', 'p1')
        .innerJoin('p1.user', 'u1')
        .addSelect((sq: SelectQueryBuilder<Answer>) => {
          return sq
            .select(
              `
          jsonb_agg(
            json_build_object(
              'questionId', "questionId",
              'answerStatus', "status",
              'addedAt', "createdAt"
            )
            ORDER BY a."createdAt" ASC
          )
        `,
            )
            .from(Answer, 'a')
            .where('p1.id = a."playerId"');
        }, 'firstPlayerAnswers')
        .addSelect([
          'p1.score as "firstPlayerScore"',
          'u1.id as "firstPlayerUserId"',
          'u1.login as "firstPlayerLogin"',
        ])
        // Краткая инфа второго игрока, и его ответы
        .leftJoin('g.secondPlayer', 'p2')
        .leftJoin('p2.user', 'u2')
        .addSelect((sq: SelectQueryBuilder<Answer>) => {
          return sq
            .select(
              `
          jsonb_agg(
            json_build_object(
              'questionId', "questionId",
              'answerStatus', "status",
              'addedAt', "createdAt"
            )
            ORDER BY a."createdAt" ASC
          )
        `,
            )
            .from(Answer, 'a')
            .where('p2.id = a."playerId"');
        }, 'secondPlayerAnswers')
        .addSelect([
          'p2.score as "secondPlayerScore"',
          'u2.id as "secondPlayerUserId"',
          'u2.login as "secondPlayerLogin"',
        ])
        // Вопросы подключенные к игре
        .addSelect((sq: SelectQueryBuilder<GameQuestion>) => {
          return sq
            .select(
              `
          jsonb_agg(
            json_build_object(
              'questionId', q.id,
              'body', q.body
            )
            ORDER BY gq.id ASC
          )
        `,
            )
            .from(GameQuestion, 'gq')
            .where('g.id = gq."gameId"')
            .innerJoin('gq.question', 'q');
        }, 'gameQuestions')
        .where('(p1.userId = :userId OR p2.userId = :userId)', { userId })
        .orderBy(
          `g."${dto.queryParams.sortBy}"`,
          `${dto.queryParams.sortDirection}`,
        )
        .limit(dto.queryParams.pageSize)
        .offset(dto.queryParams.calculateSkip());

      if (dto.queryParams.sortBy !== GamesSortBy.PairCreatedDate) {
        builder.addOrderBy(`g."createdAt"`, 'DESC');
      }

      const [rawGames, totalCount] = await Promise.all([
        builder.getRawMany<GameRawType>(),
        builder.getCount(),
      ]);

      const items = rawGames.map(GameViewDto.mapRawToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: dto.queryParams.pageNumber,
        size: dto.queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET games.query-repository, findAll: ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findGame(dto: { id?: number; userId?: string }): Promise<GameViewDto> {
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

    if (!game) {
      throw new DomainException({
        message: `Game not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return GameViewDto.mapToView(game);
  }
}
