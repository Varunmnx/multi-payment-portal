import { CashFreePaymentFailedWebhook } from './payment/payment-failure.event.dto';
import { CashFreePaymentSuccessWebhook } from './payment/payment-success.event.dto';
import { CashFreePaymentUserDroppedWebhook } from './payment/payment-user-dropped.event.dto';

type CashFreeWebHookEventType =
  | CashFreePaymentSuccessWebhook
  | CashFreePaymentFailedWebhook
  | CashFreePaymentUserDroppedWebhook;

export { CashFreeWebHookEventType };
