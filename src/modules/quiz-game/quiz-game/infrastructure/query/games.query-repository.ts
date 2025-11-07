import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Game } from '../../entities/game.entity';
import { GameStatus } from '../../common/game-status.enum';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(dto: { id: string }) {
    const result = await this.dataSource
      .getRepository(Game)
      .createQueryBuilder('g')
      .select('g.status', 'status')
      .where('g.id = :id', { id: dto.id })
      .getRawOne<{ status: GameStatus } | undefined>();

    const status = result!.status;

    const builder = this.dataSource
      .getRepository(Game)
      .createQueryBuilder('g')
      .select([
        'g.id as "gameId"',
        'g.status as "gameStatus"',
        'g.createdAt as "createdAt"',
        'g.firstPlayerId as "firstPlayerId"',
        'fpu.login as "firstPlayerLogin"',
        'fp.score as "firstPlayerScore"',
      ])
      .innerJoin('g.firstPlayer', 'fp', 'fp.id = g."firstPlayerId"')
      .innerJoin('fp.user', 'fpu', 'fpu.id = fp."userId"')
      .where('g.id = :id', { id: dto.id });

    if (status !== GameStatus.PendingSecondPlayer) {
      builder
        .innerJoin('g.secondPlayer', 'sp', 'sp.id = g."secondPlayerId"')
        .innerJoin('sp.user', 'spu', 'spu.id = sp."userId"')
        .addSelect('sp.id', 'secondPlayerId')
        .addSelect('spu.login', 'secondPlayerLogin')
        .addSelect('sp.score', 'secondPlayerScore');
    }

    const game = await builder.getRawOne();

    console.log(game);

    return game;
  }
}
