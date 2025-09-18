export interface CashFreePaymentUserDroppedWebhook {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags: Record<string, any> | null;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string; // e.g. "USER_DROPPED"
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string; // ISO datetime string
      bank_reference: string;
      auth_id: string | null;
      payment_method: {
        netbanking?: {
          channel: string | null;
          netbanking_bank_code: string;
          netbanking_bank_name: string;
        };
      };
      payment_group: string;
      international_payment: {
        international: boolean;
      };
      payment_surcharge: {
        payment_surcharge_service_charge: number;
        payment_surcharge_service_tax: number;
      } | null;
    };
    customer_details: {
      customer_name: string | null;
      customer_id: string | null;
      customer_email: string;
      customer_phone: string;
    };
    terminal_details: {
      cf_terminal_id: number;
      terminal_phone: string;
    };
  };
  event_time: string; // ISO datetime string
  type: 'PAYMENT_USER_DROPPED_WEBHOOK'; // e.g. "PAYMENT_USER_DROPPED_WEBHOOK"
}
