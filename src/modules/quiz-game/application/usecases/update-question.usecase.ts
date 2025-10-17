import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UpdateQuestionDto } from '../dto/update-question.dto';

export class UpdateQuestionCommand {
  constructor(public dto: UpdateQuestionDto) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: UpdateQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findById(dto.id);

    if (!question) {
      throw new DomainException({
        message: `Question by id:${question} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    question.updateBodyAndCorrectAnswers({
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    await this.questionsRepository.save(question);
  }
}
