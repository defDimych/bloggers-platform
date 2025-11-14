import { UuidBaseEntity } from '../../../../core/entities/uuid-base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Player } from './player.entity';
import { Question } from '../../entities/question.entity';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

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
}
