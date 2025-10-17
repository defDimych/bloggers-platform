import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PublishQuestionDto } from '../dto/publish-question.dto';

export class PublishQuestionCommand {
  constructor(public dto: PublishQuestionDto) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: PublishQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findById(dto.id);

    if (!question) {
      throw new DomainException({
        message: `Question by id:${question} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    question.makePublished(dto.published);

    await this.questionsRepository.save(question);
  }
}
