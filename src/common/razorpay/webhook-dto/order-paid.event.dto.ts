export interface RazorPayOrderPaidWebHookEvent {
  entity: 'event';
  account_id: string;
  event: 'order.paid'; // You can extend this later if needed
  contains: Array<'payment' | 'order' | string>;
  payload: {
    payment: {
      entity: RazorpayPayment;
    };
    order: {
      entity: RazorpayOrder;
    };
  };
  created_at: number; // Unix timestamp
}

export type RazorpayPaymentMethod = 'netbanking' | 'card' | 'wallet' | 'upi';

export interface RazorpayPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: RazorpayPaymentMethod;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any> | any[];
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  created_at: number;

  // Conditional properties depending on method
  card?: RazorpayCard;
}

export interface RazorpayCard {
  id: string;
  entity: 'card';
  name: string;
  last4: string;
  network: string;
  type: 'debit' | 'credit';
  issuer: string | null;
  international: boolean;
  emi: boolean;
}

export interface RazorpayOrder {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, any> | any[];
  created_at: number;
}
