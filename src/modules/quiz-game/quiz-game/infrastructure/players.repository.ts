import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayersRepository {
  constructor(
    @InjectRepository(Player) private readonly playersRepo: Repository<Player>,
  ) {}

  async save(player: Player): Promise<Player> {
    return this.playersRepo.save(player);
  }
}
