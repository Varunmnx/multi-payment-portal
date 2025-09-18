export interface CashFreePaymentSuccessWebhook {
  data: {
    order: {
      order_id: string;
      order_amount: number;
      order_currency: string;
      order_tags: Record<string, any> | null;
    };
    payment: {
      cf_payment_id: string;
      payment_status: string;
      payment_amount: number;
      payment_currency: string;
      payment_message: string;
      payment_time: string; // ISO datetime string
      bank_reference: string;
      auth_id: string | null;
      payment_method: {
        upi?: {
          channel: string;
          upi_id: string;
          upi_instrument: string;
          upi_instrument_number: string;
          upi_payer_ifsc: string;
          upi_payer_account_number: string;
        };
        // Add other payment methods here if needed (card, netbanking, etc.)
      };
      payment_group: string;
      international_payment: {
        international: boolean;
      };
      payment_surcharge: {
        payment_surcharge_service_charge: number;
        payment_surcharge_service_tax: number;
      };
    };
    customer_details: {
      customer_name: string | null;
      customer_id: string;
      customer_email: string;
      customer_phone: string;
    };
    payment_gateway_details: {
      gateway_name: string;
      gateway_order_id: string;
      gateway_payment_id: string;
      gateway_order_reference_id: string;
      gateway_settlement: string;
      gateway_status_code: string | null;
    };
    payment_offers: Array<{
      offer_id: string;
      offer_type: string;
      offer_meta: {
        offer_title: string;
        offer_description: string;
        offer_code: string;
        offer_start_time: string;
        offer_end_time: string;
      };
      offer_redemption: {
        redemption_status: string;
        discount_amount: number;
        cashback_amount: number;
      };
    }>;
    terminal_details: {
      cf_terminal_id: number;
      terminal_phone: string;
    };
  };
  event_time: string; // ISO datetime string
  type: 'PAYMENT_SUCCESS_WEBHOOK'; // e.g. "PAYMENT_SUCCESS_WEBHOOK"
}
