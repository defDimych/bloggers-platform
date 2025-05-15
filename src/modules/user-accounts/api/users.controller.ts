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
import { UsersService } from '../application/services/users.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersViewDto } from './view-dto/users.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users.query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getAllUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    return this.usersQueryRepository.getAllUsers(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserDto): Promise<UsersViewDto> {
    const userId = await this.commandBus.execute(new CreateUserCommand(body));

    return this.usersQueryRepository.findById(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
