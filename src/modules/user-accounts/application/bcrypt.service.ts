import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  async generateHash(password: string): Promise<string> {
    const passSalt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, passSalt);
  }
}
