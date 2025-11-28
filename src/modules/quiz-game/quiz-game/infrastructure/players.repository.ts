import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';
import { GameStatus } from '../common/game-status.enum';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private readonly playersRepo: Repository<Player>,
  ) {}

  // async findActivePlayerByUserId(userId: number): Promise<Player | null> {
  //   return this.playersRepo.findOne({
  //     where: [
  //       { userId, gameAsFirstPlayer: { status: GameStatus.Active } },
  //       { userId, gameAsSecondPlayer: { status: GameStatus.Active } },
  //     ],
  //     relations: [
  //       'gameAsFirstPlayer',
  //       'gameAsSecondPlayer',
  //       'answers',
  //       'gameAsFirstPlayer.gameQuestions',
  //       'gameAsFirstPlayer.gameQuestions.question',
  //       'gameAsSecondPlayer.gameQuestions',
  //       'gameAsSecondPlayer.gameQuestions.question',
  //     ],
  //   });
  // }

  async findActivePlayerByUserId(userId: number): Promise<Player | null> {
    return this.playersRepo
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.gameAsFirstPlayer', 'g1')
      .leftJoinAndSelect('g1.gameQuestions', 'g1q')
      .leftJoinAndSelect('g1q.question', 'q1')
      .leftJoinAndSelect('player.gameAsSecondPlayer', 'g2')
      .leftJoinAndSelect('g2.gameQuestions', 'g2q')
      .leftJoinAndSelect('g2q.question', 'q2')
      .leftJoinAndSelect('player.answers', 'answers')
      .where('player.userId = :userId', { userId })
      .andWhere('(g1.status = :active OR g2.status = :active)', {
        active: GameStatus.Active,
      })
      .orderBy('g1q.id', 'ASC')
      .addOrderBy('g2q.id', 'ASC')
      .getOne();
  }

  async findByGameIdAndUserId(dto: {
    gameId: string;
    userId: number;
  }): Promise<Player | null> {
    return this.playersRepo.findOne({
      where: {
        userId: dto.userId,
        gameAsFirstPlayer: {
          id: dto.gameId,
        },
      },
    });
  }

  async save(player: Player): Promise<Player> {
    return this.playersRepo.save(player);
  }
}
