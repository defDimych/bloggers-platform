import { UsersRepository } from '../../infrastructure/users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from '../../../notifications/email.service';
import { CreateUserDto } from '../../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async registerUser(dto: CreateUserDto): Promise<void> {
    // const confirmationCode = crypto.randomUUID();
    // user.setConfirmationCode(confirmationCode);
    // await this.usersRepository.save(user);
    // this.emailService
    //   .sendConfirmationEmail(user.accountData.email, confirmationCode)
    //   .catch(console.error);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
