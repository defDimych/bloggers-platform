import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../entities/question.entity';
import { IsNull, Repository } from 'typeorm';
import { QuestionsViewDto } from '../../api/view-dto/questions.view-dto';
import {
  GetQuestionsQueryParams,
  PublishedStatus,
} from '../../api/input-dto/get-questions.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
  ) {}

  async findQuestions(
    queryParams: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionsViewDto[]>> {
    try {
      const builder = this.questionsRepo
        .createQueryBuilder('q')
        .where('q."deletedAt" IS NULL');

      if (queryParams.bodySearchTerm) {
        builder.andWhere('q.body ILIKE :body', {
          body: `%${queryParams.bodySearchTerm}%`,
        });
      }

      if (queryParams.publishedStatus === PublishedStatus.Published) {
        builder.andWhere('q.published = :published', {
          published: true,
        });
      }

      if (queryParams.publishedStatus === PublishedStatus.NotPublished) {
        builder.andWhere('q.published = :published', {
          published: false,
        });
      }

      builder
        .orderBy(`"${queryParams.sortBy}"`, `${queryParams.sortDirection}`)
        .limit(queryParams.pageSize)
        .offset(queryParams.calculateSkip());

      const result = await builder.getManyAndCount();

      const items = result[0].map(QuestionsViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: result[1],
        page: queryParams.pageNumber,
        size: queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, findQuestions : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findQuestionById(id: string): Promise<QuestionsViewDto> {
    const question = await this.questionsRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });

    return QuestionsViewDto.mapToView(question!);
  }
}
