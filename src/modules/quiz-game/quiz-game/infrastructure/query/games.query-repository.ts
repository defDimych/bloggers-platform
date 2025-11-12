import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Game } from '../../entities/game.entity';
import { GameViewDto } from '../../api/view-dto/games.view-dto';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(dto: { id: string }): Promise<GameViewDto> {
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
      where: {
        id: dto.id,
      },
    });

    if (!game) {
      throw new Error(`Game by id:${dto.id} not found!`);
    }

    return GameViewDto.mapToView(game);
  }
}
