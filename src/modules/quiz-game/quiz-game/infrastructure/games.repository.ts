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

  async findActiveWithRelationsByUserId(userId: number): Promise<Game | null> {
    return this.gamesRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.firstPlayer', 'p1')
      .addSelect(['p1.id', 'p1.userId'])
      .leftJoinAndSelect('p1.answers', 'p1a')
      .leftJoinAndSelect('g.secondPlayer', 'p2')
      .addSelect(['p2.id', 'p2.userId'])
      .leftJoinAndSelect('p2.answers', 'p2a')
      .leftJoinAndSelect('g.gameQuestions', 'gq')
      .leftJoinAndSelect('gq.question', 'q')
      .where('g.status = :active', { active: GameStatus.Active })
      .andWhere('(p1.userId = :userId OR p2.userId = :userId)', { userId })
      .orderBy('gq.id', 'ASC')
      .getOne();
  }

  async findActiveByUserId(userId: number): Promise<Game | null> {
    return this.gamesRepo.findOne({
      where: [
        { status: GameStatus.Active, firstPlayer: { userId } },
        { status: GameStatus.Active, secondPlayer: { userId } },
        { status: GameStatus.PendingSecondPlayer, firstPlayer: { userId } },
      ],
      relations: ['firstPlayer', 'secondPlayer'],
    });
  }

  async findWithPendingSecondPlayer(): Promise<Game | null> {
    return this.gamesRepo.findOneBy({
      status: GameStatus.PendingSecondPlayer,
    });
  }

  async findByIdWithPairPlayers(id: number): Promise<Game | null> {
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
