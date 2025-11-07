import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameQuestion } from '../entities/game-question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameQuestionRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private readonly gameQuestionRepo: Repository<GameQuestion>,
  ) {}

  async save(gameQuestion: GameQuestion): Promise<void> {
    await this.gameQuestionRepo.save(gameQuestion);
  }
}
