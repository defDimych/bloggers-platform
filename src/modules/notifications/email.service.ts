import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      html:
        ' <h1>Thanks for your registration</h1>\n' +
        ' <p>To finish registration please follow the link below:\n' +
        `     <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>\n` +
        ' </p>\n',
    });
  }

  async sendEmailForPasswordRecovery(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      html:
        '<h1>Password recovery</h1>\n' +
        '       <p>To finish password recovery please follow the link below:\n' +
        `          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>\n` +
        '      </p>',
    });
  }
}
