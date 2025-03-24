import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { UsersViewDto } from '../../api/view-dto/users.view-dto';
import { Injectable } from '@nestjs/common';
import { GetUsersQueryParams } from '../../api/input-dto/get-users.query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/base.paginated.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getAllUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    const filter = {
      'accountData.deletedAt': null,
      $or: [
        {
          'accountData.login': {
            $regex: query.searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: query.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };

    try {
      const users = await this.UserModel.find(filter)
        .sort({ ['accountData.' + query.sortBy]: query.sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize);

      const totalCount = await this.UserModel.countDocuments(filter);

      const items = users.map(UsersViewDto.mapToView);

      return PaginatedViewDto.mapToView({
        items,
        totalCount,
        page: query.pageNumber,
        size: query.pageSize,
      });
    } catch (e) {
      console.log(
        `GET query repository, getAllUsers : ${JSON.stringify(e, null, 2)}`,
      );
      throw new Error(`some error`);
    }
  }

  async findById(id: string): Promise<UsersViewDto> {
    const user = await this.UserModel.findOne({ _id: id });

    return UsersViewDto.mapToView(user!);
  }
}
