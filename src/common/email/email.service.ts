/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateFactory } from './email.template.factory';
import nodemailer from "nodemailer"
import { EmailData, EmailTemplateType } from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateFactory: EmailTemplateFactory,
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    const emailConfig = {
      host: "smtp.gmail.com",
      port: 587,            // STARTTLS port
      secure: false,        // must be false for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD, // app password, not Gmail login password
      },
      tls: {
        rejectUnauthorized: false, // optional, helps with some environments
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SMTP connection failed:', error);
    }
  }

  async sendEmail(templateType: EmailTemplateType, emailData: EmailData): Promise<boolean> {
    try {
      const template = this.emailTemplateFactory.createTemplate(templateType);
      const html = template.generateHtml(emailData.data);
      const subject = emailData.subject || template.getSubject(emailData.data);

      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', 'noreply@yourcompany.com'),
        to: emailData.to,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${emailData.to}. MessageId: ${result.messageId}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${emailData.to}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, data: { name: string; email: string; loginUrl?: string }): Promise<boolean> {
    return this.sendEmail(EmailTemplateType.WELCOME, {
      to,
      subject: '', // Will use template's subject
      data,
    });
  }

  async sendPaymentConfirmation(
    to: string,
    data: {
      name: string;
      orderId: string;
      amount: number;
      currency: string;
      product: string;
      transactionId: string;
      paymentDate: string;
    },
  ): Promise<boolean> {
    return this.sendEmail(EmailTemplateType.PAYMENT_CONFIRMATION, {
      to,
      subject: '', // Will use template's subject
      data,
    });
  }

  async sendPasswordReset(to: string, data: { name: string; resetUrl: string; expiresIn: string }): Promise<boolean> {
    return this.sendEmail(EmailTemplateType.PASSWORD_RESET, {
      to,
      subject: '', // Will use template's subject
      data,
    });
  }

  async sendCustomEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('SMTP_FROM', 'noreply@yourcompany.com'),
        to,
        subject,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Custom email sent successfully to ${to}. MessageId: ${result.messageId}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send custom email to ${to}:`, error);
      return false;
    }
  }
}
