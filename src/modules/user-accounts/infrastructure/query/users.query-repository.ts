import { UsersViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findAllUsers(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    const where: any[] = [];

    if (queryParams.searchLoginTerm) {
      where.push({ login: ILike(`%${queryParams.searchLoginTerm}%`) });
    }

    if (queryParams.searchEmailTerm) {
      where.push({ email: ILike(`%${queryParams.searchEmailTerm}%`) });
    }

    try {
      const result: [User[], number] = await this.usersRepo.findAndCount({
        where,
        order: { [queryParams.sortBy]: queryParams.sortDirection },
        skip: queryParams.calculateSkip(),
        take: queryParams.pageSize,
        withDeleted: false,
      });

      const items = result[0].map(UsersViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount: result[1],
        page: queryParams.pageNumber,
        size: queryParams.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, findAllUsers : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findUserById(id: number): Promise<UsersViewDto> {
    const user = await this.usersRepo.findOne({
      where: { id: id },
      withDeleted: false,
    });

    return UsersViewDto.mapToView(user!);
  }
}
