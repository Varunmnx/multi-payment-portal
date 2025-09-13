import { RazorPayOrderPaidWebHookEvent } from './order-paid.event.dto';
import { RazorpayPaymentAuthorizedWebhookEvent } from './payment-authorized.event.dto';
import { RazorpayPaymentCapturedWebhookEvent } from './payment-captured.event.dto';
import { RazorpayPaymentFailedWebhookEvent } from './payment-failed.event.dto';

export type RazorPayWebhookEvent =
  | RazorpayPaymentAuthorizedWebhookEvent
  | RazorpayPaymentCapturedWebhookEvent
  | RazorPayOrderPaidWebHookEvent
  | RazorpayPaymentFailedWebhookEvent;
