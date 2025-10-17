import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

export enum PublishedStatus {
  All = 'all',
  Published = 'published',
  NotPublished = 'notPublished',
}

export class GetQuestionsQueryParams extends BaseQueryParams {
  sortBy: string = 'createdAt';
  bodySearchTerm: string | null = null;
  publishedStatus: PublishedStatus = PublishedStatus.All;
}
