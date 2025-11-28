import { UuidBaseEntity } from '../../../../core/entities/uuid-base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Player } from './player.entity';
import { Question } from '../../entities/question.entity';
import { AnswerStatus } from '../common/answer-status.enum';
import { CreateAnswerEntityDto } from './dto/create-answer.entity-dto';

@Entity({ name: 'Answers' })
export class Answer extends UuidBaseEntity {
  @Column({ type: 'enum', enum: AnswerStatus })
  status: AnswerStatus;

  @ManyToOne(() => Player, (player) => player.answers)
  player: Player;

  @Column()
  playerId: string;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;

  @Column()
  questionId: string;

  static create(dto: CreateAnswerEntityDto): Answer {
    const answer = new this();

    answer.questionId = dto.questionId;
    answer.playerId = dto.playerId;
    answer.status = dto.status;

    return answer;
  }
}
