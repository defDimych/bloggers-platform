import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ id }: DeleteQuestionCommand): Promise<void> {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new DomainException({
        message: `Question by id:${question} not found!`,
        code: DomainExceptionCode.NotFound,
      });
    }

    if (question.published) {
      throw new DomainException({
        message: 'Published questions cannot be deleted',
        code: DomainExceptionCode.Forbidden,
      });
    }

    question.makeDeleted();

    await this.questionsRepository.save(question);
  }
}
