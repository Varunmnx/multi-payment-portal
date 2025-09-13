import { RazorpayDisputeEventType } from './razorpay-dispute.event.dto';
import { RazorpayInvoiceEventType } from './razorpay-invoice.event.dto';
import { RazorpayOrderEventType } from './razorpay-order.event.dto';
import { RazorpayRefundEventType } from './razorpay-refund.event.dto';
import { RazropaySubscriptionEventType } from './razorpay-subscription.event.dto';

export type RazorpayEvents =
  | RazorpayDisputeEventType
  | RazorpayOrderEventType
  | RazorpayInvoiceEventType
  | RazorpayRefundEventType
  | RazropaySubscriptionEventType;
