import { Column, Entity, OneToMany } from 'typeorm';
import { UuidBaseEntity } from '../../../core/entities/uuid-base.entity';
import { GameQuestion } from '../quiz-game/entities/game-question.entity';
import { Answer } from '../quiz-game/entities/answer.entity';

export const bodyConstraints = {
  minLength: 10,
  maxLength: 500,
};

@Entity({ name: 'Questions' })
export class Question extends UuidBaseEntity {
  @Column({ type: 'varchar', length: bodyConstraints.maxLength })
  body: string;

  @Column({ type: 'varchar', array: true })
  correctAnswers: string[];

  @Column({ type: 'boolean' })
  published: boolean;

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.question)
  gameQuestions: GameQuestion[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  static create(dto: { body: string; correctAnswers: string[] }): Question {
    const question = new this();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;
    question.updatedAt = null;

    return question;
  }

  updateBodyAndCorrectAnswers(dto: {
    body: string;
    correctAnswers: string[];
  }): void {
    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
  }

  makePublished(isPublished: boolean): void {
    this.published = isPublished;
  }
}
