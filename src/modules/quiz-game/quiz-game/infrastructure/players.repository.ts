import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../../infrastructure/repositories/base.repository';

@Injectable()
export class PlayersRepository extends BaseRepository<Player> {
  constructor(
    @InjectRepository(Player) private readonly playersRepo: Repository<Player>,
  ) {
    super(playersRepo);
  }

  async findByIdWithAnswers(playerId: string): Promise<Player | null> {
    return this.playersRepo.findOne({
      where: {
        id: playerId,
      },
      relations: {
        answers: true,
      },
    });
  }

  async updateScore(dto: { playerId: string; score: number }): Promise<void> {
    await this.playersRepo.update(dto.playerId, { score: dto.score });
  }

  async save(player: Player, entityManager?: EntityManager): Promise<Player> {
    const repo = this.getRepository(entityManager);
    return repo.save(player);
  }
}
