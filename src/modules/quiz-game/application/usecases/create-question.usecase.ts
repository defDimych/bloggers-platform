import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/create-question.dto';
import { QuestionsRepository } from '../../infrastructure/questions.repository';
import { Question } from '../../entities/question.entity';

export class CreateQuestionCommand extends Command<string> {
  constructor(public dto: CreateQuestionDto) {
    super();
  }
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand, string>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({ dto }: CreateQuestionCommand): Promise<string> {
    const question = Question.create(dto);

    await this.questionsRepository.save(question);

    return question.id;
  }
}
