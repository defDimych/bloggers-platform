import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private readonly playersRepo: Repository<Player>,
  ) {}

  async updateScore(dto: { playerId: string; score: number }): Promise<void> {
    await this.playersRepo.update(dto.playerId, { score: dto.score });
  }

  async save(player: Player): Promise<Player> {
    return this.playersRepo.save(player);
  }
}
