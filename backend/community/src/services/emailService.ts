import config from '@/config';
import Mailer from '@/loaders/mailer';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Inject, Service } from 'typedi';
import { EmailUtilService } from './emailUtilService';

@Service()
export default class EmailService {
  constructor(
    @Inject('emailClient') private emailClient: typeof Mailer,
    @Inject('logger') private logger,
    private mailUtilService: EmailUtilService,
  ) {}

  private SUCCESS = (messageId: string, statusMsg: string) => {
    return { delivered: 1, messageId, status: statusMsg };
  };

  private ERROR = error => {
    return { delivered: 0, messageId: null, status: 'error', error };
  };

  public sendResetPasswordEmail = async (email: string, otp: string, otp_expiry: Date) => {
    dayjs.extend(relativeTime);
    const now = dayjs(new Date());
    const expireDate = dayjs(otp_expiry);
    const expireTime = expireDate.from(now, true);

    const template = this.mailUtilService.resetPasswordEmailTemplate(expireTime, otp);

    const message = this.emailClient.generateMessage({
      html: template.html,
      subject: template.subject,
      text: template.text,
      to: [{ address: email }],
      sender: config.emails.sender,
    });

    try {
      const { status: statusMsg, id: messageId } = await this.emailClient.sendEmail(message);

      const status = this.SUCCESS(messageId, statusMsg);
      this.logger.info('%o', status);
      return status;
    } catch (e) {
      const status = this.ERROR(e);
      this.logger.error('%o', status);
      return status;
    }
  };
}
