import { Column, Entity } from 'typeorm';
import { UuidBaseEntity } from '../../../core/entities/uuid-base.entity';

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

  static create(dto: { body: string; correctAnswers: string[] }): Question {
    const question = new this();

    question.body = dto.body;
    question.correctAnswers = dto.correctAnswers;
    question.published = false;

    return question;
  }
}
