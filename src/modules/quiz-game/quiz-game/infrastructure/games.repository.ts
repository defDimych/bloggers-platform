import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from '../entities/game.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../common/game-status.enum';

@Injectable()
export class GamesRepository {
  constructor(
    @InjectRepository(Game) private readonly gamesRepo: Repository<Game>,
  ) {}

  async findWithPendingSecondPlayer(): Promise<Game | null> {
    return this.gamesRepo.findOneBy({
      status: GameStatus.PendingSecondPlayer,
    });
  }

  async findByIdWithPairPlayers(id: string): Promise<Game | null> {
    return this.gamesRepo.findOne({
      where: { id },
      relations: {
        firstPlayer: true,
        secondPlayer: true,
      },
    });
  }

  async save(game: Game): Promise<Game> {
    return this.gamesRepo.save(game);
  }
}
