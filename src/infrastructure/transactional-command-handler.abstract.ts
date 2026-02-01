import { ICommand } from '@nestjs/cqrs';
import { DataSource, EntityManager } from 'typeorm';

export abstract class TransactionalCommandHandler<C extends ICommand> {
  protected constructor(protected readonly dataSource: DataSource) {}

  async execute(command: C): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const entityManager = queryRunner.manager;

    try {
      const result = await this.handle(command, entityManager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  protected abstract handle(
    command: C,
    entityManager: EntityManager,
  ): Promise<number>;
}
