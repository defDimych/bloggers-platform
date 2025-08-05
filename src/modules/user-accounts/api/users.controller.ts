import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users.query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../auth/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { IdValidationTransformationPipe } from '../../../core/pipes/id-validation-transformation.pipe';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<UsersViewDto> {
    const userId = await this.commandBus.execute(new CreateUserCommand(body));

    return this.usersQueryRepository.findById(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', IdValidationTransformationPipe) id: number,
  ): Promise<void> {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
