import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  async generateHash(password: string): Promise<string> {
    const passSalt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, passSalt);
  }

  async comparePasswords(args: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }
}
