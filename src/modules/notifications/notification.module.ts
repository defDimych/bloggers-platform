import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for port 465, false for other ports.
        auth: {
          user: 'def.dimych@gmail.com', // TODO: Move to env file
          pass: 'sana pkdn rbod fpei', // TODO: Move to env file
        },
      },
      defaults: {
        from: '"blogger-platform" <def.dimych@gmail.com>',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
