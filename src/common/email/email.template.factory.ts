import { Injectable } from '@nestjs/common';
import {
  EmailTemplate,
  EmailTemplateType,
  PasswordResetTemplate,
  PaymentConfirmationTemplate,
  WelcomeEmailTemplate,
} from './templates';

@Injectable()
export class EmailTemplateFactory {
  createTemplate(type: EmailTemplateType): EmailTemplate {
    switch (type) {
      case EmailTemplateType.WELCOME:
        return new WelcomeEmailTemplate();
      case EmailTemplateType.PAYMENT_CONFIRMATION:
        return new PaymentConfirmationTemplate();
      case EmailTemplateType.PASSWORD_RESET:
        return new PasswordResetTemplate();
      default:
        throw new Error(`Unknown email template type: ${type}`);
    }
  }
}
