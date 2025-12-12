import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesStats } from '../entities/game-stats.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GamesStatsRepository {
  constructor(
    @InjectRepository(GamesStats)
    private readonly gameStatsRepo: Repository<GamesStats>,
  ) {}

  async save(stats: GamesStats): Promise<void> {
    await this.gameStatsRepo.save(stats);
  }

  async findByUserId(userId: number): Promise<GamesStats | null> {
    return this.gameStatsRepo.findOneBy({ userId });
  }
}
