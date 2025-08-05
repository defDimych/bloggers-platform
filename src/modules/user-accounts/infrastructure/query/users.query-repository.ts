import { UsersViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserDbType } from '../../types/user-db.type';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    let filter = `"deletedAt" IS NULL`;
    let params: string[] | [] = [];

    if (queryParams.searchEmailTerm || queryParams.searchLoginTerm) {
      filter = `(login ILIKE $1 OR email ILIKE $2) AND "deletedAt" IS NULL`;
      params = [
        `%${queryParams.searchLoginTerm}%`,
        `%${queryParams.searchEmailTerm}%`,
      ];
    }
    try {
      const users = await this.dataSource.query<UserDbType[]>(
        `SELECT * FROM "Users" 
WHERE ${filter}
ORDER BY "${queryParams.sortBy}" ${queryParams.sortDirection}
LIMIT ${queryParams.pageSize}
OFFSET ${queryParams.calculateSkip()}`,
        params,
      );

      const totalCount = await this.dataSource.query<{ totalCount: string }[]>(
        `SELECT 
COUNT(*) FILTER (WHERE ${filter}) AS "totalCount"
FROM "Users";`,
        params,
      );

      const items = users.map(UsersViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: Number(totalCount[0].totalCount),
        page: queryParams.pageNumber,
        size: queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, getAllUsers : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findById(id: number): Promise<UsersViewDto> {
    const result = await this.dataSource.query<UserDbType[]>(
      `SELECT * FROM "Users" WHERE id = $1`,
      [id],
    );

    return UsersViewDto.mapToView(result[0]);
  }
}
