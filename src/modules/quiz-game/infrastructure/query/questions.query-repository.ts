import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../entities/question.entity';
import { IsNull, Repository } from 'typeorm';
import { QuestionsViewDto } from '../../api/view-dto/questions.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async findQuestionById(id: string): Promise<QuestionsViewDto> {
    const question = await this.questionsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    return QuestionsViewDto.mapToView(question!);
  }
}
