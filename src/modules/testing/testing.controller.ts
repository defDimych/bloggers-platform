import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(): Promise<{ status: string }> {
    const tables = await this.dataSource.query<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public';`,
    );

    const promises = tables.map((table) => {
      return this.dataSource.query(
        `TRUNCATE TABLE "${table.table_name}" CASCADE;`,
      );
    });
    await Promise.all(promises);

    return {
      status: 'succeeded',
    };
  }
}
