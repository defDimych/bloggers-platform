import { EntityManager, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  protected getRepository(entityManager?: EntityManager): Repository<T> {
    return entityManager
      ? entityManager.getRepository(this.repository.metadata.target)
      : this.repository;
  }
}
