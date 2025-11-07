import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private readonly playersRepo: Repository<Player>,
  ) {}

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
