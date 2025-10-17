import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../entities/question.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async findById(id: string): Promise<Question | null> {
    return this.questionsRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  async save(question: Question): Promise<void> {
    await this.questionsRepo.save(question);
  }
}
