export interface RazorpayPaymentFailedWebhookEvent {
  entity: 'event';
  account_id: string;
  event: 'payment.failed';
  contains: Array<'payment' | string>;
  payload: {
    payment: {
      entity: RazorpayFailedPayment;
    };
  };
  created_at: number;
}

// ---------- Base Payment Fields ----------
export interface RazorpayFailedPayment {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'failed';
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: 'netbanking' | 'card' | 'wallet' | 'upi';
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
  fee: number | null;
  tax: number | null;

  // ---- Error fields (always present in failed) ----
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;

  // ---- Additional data ----
  acquirer_data?: {
    bank_transaction_id?: string | null;
    auth_code?: string;
    rrn?: string | null;
    transaction_id?: string | null;
  };

  // ---- Optional nested objects ----
  card?: RazorpayCard;
  upi?: RazorpayUPI;

  created_at: number;
}

// ---------- Card Object ----------
export interface RazorpayCard {
  id: string;
  entity: 'card';
  name: string | null;
  last4: string;
  network: string;
  type: 'credit' | 'debit';
  issuer: string | null;
  international: boolean;
  emi: boolean;
  iin?: string;
  sub_type?: string;
}

// ---------- UPI Object ----------
export interface RazorpayUPI {
  payer_account_type?: string;
  vpa: string;
  flow?: string;
}
