import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../application/users.service';
import { EmailDto } from '../dto/email.dto';
import { ConfirmPassRecoveryDto } from '../dto/confirm-pass-recovery.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  login(@ExtractUserFromRequest() user: UserContextDto): {
    accessToken: string;
  } {
    return this.authService.login(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserDto): Promise<void> {
    return this.usersService.registerUser(body);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: { code: string },
  ): Promise<void> {
    return this.authService.emailConfirmation(body);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailDto): Promise<void> {
    return this.authService.registrationEmailResending(body);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: EmailDto): Promise<void> {
    return this.authService.passwordRecovery(body);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecoveryConfirmation(
    @Body() body: ConfirmPassRecoveryDto,
  ): Promise<void> {
    return this.authService.confirmPasswordRecovery(body);
  }
}
