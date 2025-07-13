import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { CreateUserDto } from '../../user-accounts/dto/create-user.dto';
import { EmailDto } from '../dto/email.dto';
import { ConfirmPassRecoveryDto } from '../dto/confirm-pass-recovery.dto';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from '../../user-accounts/api/view-dto/users.view-dto';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { Response } from 'express';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { EmailConfirmationCommand } from '../application/usecases/email-confirmation.usecase';
import { RegistrationEmailResendingCommand } from '../application/usecases/registration-email-resending.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery.usecase';
import { ConfirmPasswordRecoveryCommand } from '../application/usecases/confirm-password-recovery.usecase';
import { ExtractClientDetails } from './decorators/extract-client-details';
import { ClientDetailsDto } from './dto/client-details.dto';
import { JwtRefreshAuthGuard } from '../guards/bearer/jwt-refresh-auth.guard';
import { ExtendedUserContextDto } from '../guards/dto/extended-user-context.dto';
import { RefreshTokensCommand } from '../application/usecases/refresh-tokens.usecase';
import { ExtractExtendedUserFromRequest } from '../guards/decorators/param/extract-extended-user-from-request.decorator';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authQueryRepository: AuthQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return this.authQueryRepository.me(user.userId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Res({ passthrough: true }) res: Response,
    @ExtractUserFromRequest() user: UserContextDto,
    @ExtractClientDetails() clientDetails: ClientDetailsDto,
  ): Promise<{ accessToken: string }> {
    const result = await this.commandBus.execute(
      new LoginUserCommand({
        userId: user.userId,
        IP: clientDetails.IP,
        deviceName: clientDetails.deviceName,
      }),
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @SkipThrottle()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async logout(
    @ExtractExtendedUserFromRequest() user: ExtendedUserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(new LogoutUserCommand(user.sessionId));
  }

  @SkipThrottle()
  @Post('refresh-token')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshTokens(
    @ExtractExtendedUserFromRequest() user: ExtendedUserContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    // TODO: Вопрос по dto
    const result = await this.commandBus.execute(
      new RefreshTokensCommand(user),
    );

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() body: CreateUserDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body() body: { code: string },
  ): Promise<void> {
    return this.commandBus.execute(new EmailConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(@Body() body: EmailDto): Promise<void> {
    return this.commandBus.execute(new RegistrationEmailResendingCommand(body));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(@Body() body: EmailDto): Promise<void> {
    return this.commandBus.execute(new PasswordRecoveryCommand(body));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecoveryConfirmation(
    @Body() body: ConfirmPassRecoveryDto,
  ): Promise<void> {
    return this.commandBus.execute(new ConfirmPasswordRecoveryCommand(body));
  }
}
