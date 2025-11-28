import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswersRepository {
  constructor(
    @InjectRepository(Answer) private readonly answersRepo: Repository<Answer>,
  ) {}

  async save(answer: Answer): Promise<Answer> {
    return this.answersRepo.save(answer);
  }
}
