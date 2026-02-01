import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../entities/question.entity';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { BaseRepository } from '../../../infrastructure/repositories/base.repository';

@Injectable()
export class QuestionsRepository extends BaseRepository<Question> {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {
    super(questionsRepo);
  }

  async findById(id: string): Promise<Question | null> {
    return this.questionsRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  async findFiveRandom(entityManager?: EntityManager): Promise<Question[]> {
    const repo = this.getRepository(entityManager);

    return repo
      .createQueryBuilder('q')
      .where('q.published = :isPublished', { isPublished: true })
      .andWhere('q."deletedAt" IS NULL')
      .orderBy('RANDOM()')
      .limit(5)
      .getMany();
  }

  async save(question: Question): Promise<void> {
    await this.questionsRepo.save(question);
  }
}
