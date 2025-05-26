import { CreateUserDto } from '../../dto/create-user.dto';
import { CryptoService } from '../../../auth/application/services/crypto.service';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../services/users.service';

export class UsersFactory {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    private usersService: UsersService,
    private bcryptService: CryptoService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    await this.usersService.checkUniqueOrThrow(dto.login, dto.email);

    const passwordHash = await this.createPasswordHash(dto.password);

    return this.createUserInstance(dto, passwordHash);
  }

  private async createPasswordHash(password: string): Promise<string> {
    return this.bcryptService.generateHash(password);
  }

  private createUserInstance(
    dto: CreateUserDto,
    passwordHash: string,
  ): UserDocument {
    return this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }
}
