/* eslint-disable prettier/prettier */
type RazorpayPaymentEvents = 'payment.captured' | 'payment.failed' | 'payment.authorized';
type RazorpayOrderSuccessfullyBeenPaidEvents = 'order.paid';

export type RazorpayOrderEventType = RazorpayPaymentEvents | RazorpayOrderSuccessfullyBeenPaidEvents

