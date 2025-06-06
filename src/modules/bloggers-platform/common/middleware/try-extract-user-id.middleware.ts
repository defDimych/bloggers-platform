import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../../auth/config/auth.config';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

@Injectable()
export class TryExtractUserIdMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private authConfig: AuthConfig,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req['userId'] = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload: JwtPayload = this.jwtService.verify(token, {
        secret: this.authConfig.accessTokenSecret,
      });

      req['userId'] = payload.id;
      next();
    } catch (e) {
      console.log(e);

      req['userId'] = null;
      next();
    }
  }
}
