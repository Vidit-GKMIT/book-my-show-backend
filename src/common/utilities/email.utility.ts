import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Mail {
  constructor(private readonly mailService: MailerService) {}

  sendMail(message: string, subject: string, email: string): void {
    this.mailService.sendMail({
      from: 'khandelwal7vidit@gmail.com',
      to: `${email}`,
      subject: subject,
      text: message,
    });
  }
}
