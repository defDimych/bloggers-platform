import { CreateUserDto } from '../dto/create-user.dto';
import { BcryptService } from './bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private bcryptService: BcryptService,
    private usersRepository: UsersRepository,
  ) {}
  async createUser(dto: CreateUserDto): Promise<string> {
    const foundUser = await this.usersRepository.findUserByLoginOrEmail(
      dto.login,
      dto.email,
    );

    if (foundUser) {
      throw new BadRequestException();
    }

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    user.confirmEmail();

    await this.usersRepository.save(user);

    return user._id.toString();
  }
}
