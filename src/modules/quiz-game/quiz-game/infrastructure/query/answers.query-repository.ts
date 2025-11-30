import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../../entities/answer.entity';
import { Repository } from 'typeorm';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { AnswersViewDto } from '../../api/view-dto/answers.view-dto';

@Injectable()
export class AnswersQueryRepository {
  constructor(
    @InjectRepository(Answer) private readonly answersRepo: Repository<Answer>,
  ) {}

  async findById(answerId: string): Promise<AnswersViewDto> {
    const answer = await this.answersRepo.findOne({
      where: {
        id: answerId,
      },
    });

    if (!answer) {
      throw new DomainException({
        message: `Answer with id: ${answerId} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    return AnswersViewDto.mapToView(answer);
  }
}
