import EmailService from '@/services/emailService';
import { NextFunction, Request, Response } from 'express';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';

@Service()
export class DevController {
  protected emailServiceInstance: EmailService;
  protected logger: Logger;

  constructor(emailService: EmailService, @Inject('logger') logger: Logger) {
    this.emailServiceInstance = emailService;
    this.logger = logger;
  }

  public sendEmail = async(req: Request, res: Response, next: NextFunction) => {
    this.logger.debug('Calling send email endpoint');
    try {
      const email = req.body.email;
      const otp = req.body.otp;
      const otp_expiry = req.body.otp_expiry;

      const emailStatus = await this.emailServiceInstance.sendResetPasswordEmail(email, otp, otp_expiry);
      return res.status(200).json(emailStatus);
    } catch (error) {
      return next(error);
    }
  };
}
