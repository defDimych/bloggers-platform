import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { NotificationConfig } from './notification.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [NotificationModule],
      useFactory: (notificationConfig: NotificationConfig) => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for port 465, false for other ports.
            auth: {
              user: notificationConfig.emailUserName,
              pass: notificationConfig.emailPassword,
            },
          },
          defaults: {
            from: '"blogger-platform" <def.dimych@gmail.com>',
          },
        };
      },
      inject: [NotificationConfig],
    }),
  ],
  providers: [EmailService, NotificationConfig],
  exports: [EmailService, NotificationConfig],
})
export class NotificationModule {}
