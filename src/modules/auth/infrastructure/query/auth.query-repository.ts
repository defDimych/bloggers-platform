import { Injectable } from '@nestjs/common';
import { MeViewDto } from '../../../user-accounts/api/view-dto/users.view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserDbModel } from '../../../user-accounts/types/user-db-model.type';

@Injectable()
export class AuthQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async me(userId: number): Promise<MeViewDto> {
    const result = await this.dataSource.query<UserDbModel[]>(
      `SELECT * FROM "Users" WHERE id = $1`,
      [userId],
    );

    return MeViewDto.mapToView(result[0]);
  }
}
