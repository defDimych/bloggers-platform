import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameQuestion } from '../entities/game-question.entity';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepository } from '../../../../infrastructure/repositories/base.repository';

@Injectable()
export class GameQuestionRepository extends BaseRepository<GameQuestion> {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepo: Repository<GameQuestion>,
  ) {
    super(gameQuestionRepo);
  }

  async save(
    gameQuestion: GameQuestion,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repo = this.getRepository(entityManager);
    await repo.save(gameQuestion);
  }
}
