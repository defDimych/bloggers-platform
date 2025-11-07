import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from './game.entity';
import { Question } from '../../entities/question.entity';

@Entity({ name: 'Games-Questions' })
export class GameQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Game, (game) => game.gameQuestions)
  game: Game;

  @Column()
  gameId: string;

  @ManyToOne(() => Question, (question) => question.gameQuestions)
  question: Question;

  @Column()
  questionId: string;

  static create(dto: { gameId: string; questionId: string }): GameQuestion {
    const gameQuestion = new this();

    gameQuestion.gameId = dto.gameId;
    gameQuestion.questionId = dto.questionId;

    return gameQuestion;
  }
}
