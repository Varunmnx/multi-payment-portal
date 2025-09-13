export interface RazorpayPaymentCapturedWebhookEvent {
  entity: 'event';
  account_id: string;
  event: 'payment.captured';
  contains: Array<'payment' | string>;
  payload: {
    payment: {
      entity: RazorpayCapturedPayment;
    };
  };
  created_at: number;
}

// --------- Base Payment Fields ----------
interface RazorpayPaymentBase {
  id: string;
  entity: 'payment';
  amount: number;
  base_amount?: number;
  currency: string;
  status: 'captured';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  amount_refunded: number;
  amount_transferred: number;
  refund_status: string | null;
  captured: true;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: Record<string, any> | any[];
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  created_at: number;
  acquirer_data?: Record<string, any>;
}

// --------- Variants by method ----------
export interface RazorpayNetbankingCapturedPayment extends RazorpayPaymentBase {
  method: 'netbanking';
  bank: string;
}

export interface RazorpayCardCapturedPayment extends RazorpayPaymentBase {
  method: 'card';
  card_id: string;
  card: RazorpayCard;
  token_id?: string;
}

export interface RazorpayWalletCapturedPayment extends RazorpayPaymentBase {
  method: 'wallet';
  wallet: string;
}

export interface RazorpayUpiCapturedPayment extends RazorpayPaymentBase {
  method: 'upi';
  vpa: string;
  upi?: {
    payer_account_type?: string;
    vpa?: string;
    flow?: string;
  };
}

// Union of all captured payments
export type RazorpayCapturedPayment =
  | RazorpayNetbankingCapturedPayment
  | RazorpayCardCapturedPayment
  | RazorpayWalletCapturedPayment
  | RazorpayUpiCapturedPayment;

// --------- Card Details ----------
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
  iin?: string;
  sub_type?: string;
}
