/* eslint-disable prettier/prettier */
import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreateCashfreeOrderDto } from "../dto/cashfree/create-payment.dto";
import { firstValueFrom } from "rxjs";
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';

@Injectable()
export class CashFreeService {
  private readonly logger = new Logger(CashFreeService.name);
  private readonly cashfreeBaseUrl: string;
  private readonly cashfreeApiVersion = "2023-08-01";
  private readonly clientId: string;
  private readonly clientSecret: string;

  // Sample product and prices manager
  private products = {
    "product_1": { name: "Basic Plan", price: 1000 }, // ₹10.00
    "product_2": { name: "Premium Plan", price: 5000 }, // ₹50.00
    "product_3": { name: "Enterprise Plan", price: 10000 }, // ₹100.00
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.cashfreeBaseUrl = this.configService.get<string>('CASHFREE_BASE_URL') || "https://sandbox.cashfree.com/pg";
    this.clientId = this.configService.get<string>('CASHFREE_APP_ID');
    this.clientSecret = this.configService.get<string>('CASHFREE_APP_SECRET');

    if (!this.clientId || !this.clientSecret) {
      this.logger.error('Cashfree credentials not found in environment variables');
      throw new Error('Cashfree credentials not configured');
    }

    this.logger.log(`Cashfree initialized with base URL: ${this.cashfreeBaseUrl}`);
    this.logger.log(`Using Client ID: ${this.clientId.substring(0, 8)}...`);
  }

  async createOrder(createOrderDto: CreateCashfreeOrderDto) {
    const { productId, customerName, customerEmail, customerPhone } = createOrderDto;

    // Validate product
    if (!this.products[productId]) {
      throw new Error(`Invalid product ID: ${productId}`);
    }

    const product = this.products[productId];
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderRequest = {
      order_id: orderId,
      order_amount: product.price / 100, // Convert paise to rupees
      order_currency: "INR",
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: this.configService.get<string>('CASHFREE_RETURN_URL') || "http://localhost:5173/cashfree/payment/success",
        notify_url: this.configService.get<string>('CASHFREE_WEBHOOK_URL') || "https://zion-unchallenging-annika.ngrok-free.app/api/payment-service/cashfree/webhook",
      },
    };

    try {
      const orderUrl = `${this.cashfreeBaseUrl}/orders`;
      
      this.logger.log(`Creating order for product: ${productId}, amount: ₹${orderRequest.order_amount}`);
      this.logger.log(`Order request:`, JSON.stringify(orderRequest, null, 2));

      const response = await firstValueFrom(
        this.httpService.post(orderUrl, orderRequest, {
          headers: {
            "X-Client-Id": this.clientId,
            "X-Client-Secret": this.clientSecret,
            "Content-Type": "application/json",
            "x-api-version": this.cashfreeApiVersion,
            "x-request-id": `req_${Date.now()}`,
          },
        })
      );

      this.logger.log(`Order created successfully: ${orderId}`);

      return {
        order_id: response.data.order_id,
        payment_session_id: response.data.payment_session_id,
        order_status: response.data.order_status,
        order_amount: response.data.order_amount,
        order_currency: response.data.order_currency,
        product: product,
        productId: productId,
        created_at: new Date().toISOString(),
        checkout_url: response.data.checkout_url || `https://payments.cashfree.com/order/#/${response.data.payment_session_id}`,
      };
    } catch (error) {
      this.logger.error('Cashfree order creation failed', error);
      if (error instanceof AxiosError) {
        const errorDetails = error.response?.data;
        const errorMessage = errorDetails?.message || errorDetails?.error_description || error.message;
        this.logger.error('Cashfree API Error Details:', errorDetails);
        this.logger.error(`Request URL: ${error.config?.url}`);
        this.logger.error(`Request Headers:`, error.config?.headers);
        throw new Error(`Cashfree order creation failed: ${errorMessage}`);
      }
      throw new Error(`Cashfree order creation failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const orderUrl = `${this.cashfreeBaseUrl}/orders/${orderId}`;
      
      this.logger.log(`Fetching order status for: ${orderId}`);

      const response = await firstValueFrom(
        this.httpService.get(orderUrl, {
          headers: {
            "X-Client-Id": this.clientId,
            "X-Client-Secret": this.clientSecret,
            "Content-Type": "application/json",
            "x-api-version": this.cashfreeApiVersion,
            "x-request-id": `req_${Date.now()}`,
          },
        })
      );

      return {
        order_id: response.data.order_id,
        order_status: response.data.order_status,
        order_amount: response.data.order_amount,
        order_currency: response.data.order_currency,
        created_at: response.data.created_at,
        customer_details: response.data.customer_details,
        payments: response.data.payments || [],
      };
    } catch (error) {
      this.logger.error(`Failed to fetch order status for: ${orderId}`, error);
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          throw new Error(`Order not found: ${orderId}`);
        }
        const errorDetails = error.response?.data;
        const errorMessage = errorDetails?.message || errorDetails?.error_description || error.message;
        throw new Error(`Failed to fetch order status: ${errorMessage}`);
      }
      throw new Error(`Failed to fetch order status: ${error.message}`);
    }
  }

  async getPaymentDetails(orderId: string, paymentId: string) {
    try {
      const paymentUrl = `${this.cashfreeBaseUrl}/orders/${orderId}/payments/${paymentId}`;
      
      this.logger.log(`Fetching payment details for: ${orderId}/${paymentId}`);

      const response = await firstValueFrom(
        this.httpService.get(paymentUrl, {
          headers: {
            "X-Client-Id": this.clientId,
            "X-Client-Secret": this.clientSecret,
            "Content-Type": "application/json",
            "x-api-version": this.cashfreeApiVersion,
            "x-request-id": `req_${Date.now()}`,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch payment details for: ${orderId}/${paymentId}`, error);
      if (error instanceof AxiosError) {
        const errorDetails = error.response?.data;
        const errorMessage = errorDetails?.message || errorDetails?.error_description || error.message;
        throw new Error(`Failed to fetch payment details: ${errorMessage}`);
      }
      throw new Error(`Failed to fetch payment details: ${error.message}`);
    }
  }

  async initiateRefund(orderId: string, refundAmount?: number, refundNote?: string) {
    try {
      const orderStatus = await this.getOrderStatus(orderId);
      
      if (orderStatus.order_status !== 'PAID') {
        throw new Error('Order must be in PAID status to initiate refund');
      }

      const refundRequest = {
        refund_amount: refundAmount || orderStatus.order_amount,
        refund_id: `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        refund_note: refundNote || 'Customer requested refund',
      };

      const refundUrl = `${this.cashfreeBaseUrl}/orders/${orderId}/refunds`;
      
      this.logger.log(`Initiating refund for order: ${orderId}, amount: ${refundRequest.refund_amount}`);

      const response = await firstValueFrom(
        this.httpService.post(refundUrl, refundRequest, {
          headers: {
            "X-Client-Id": this.clientId,
            "X-Client-Secret": this.clientSecret,
            "Content-Type": "application/json",
            "x-api-version": this.cashfreeApiVersion,
            "x-request-id": `req_${Date.now()}`,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to initiate refund for: ${orderId}`, error);
      if (error instanceof AxiosError) {
        const errorDetails = error.response?.data;
        const errorMessage = errorDetails?.message || errorDetails?.error_description || error.message;
        throw new Error(`Failed to initiate refund: ${errorMessage}`);
      }
      throw new Error(`Failed to initiate refund: ${error.message}`);
    }
  }

  async verifyPayment(orderId: string): Promise<boolean> {
    try {
      const orderStatus = await this.getOrderStatus(orderId);
      return orderStatus.order_status === 'PAID';
    } catch (error) {
      this.logger.error(`Failed to verify payment for: ${orderId}`, error);
      return false;
    }
  }

  getProducts() {
    return Object.entries(this.products).map(([id, product]) => ({
      id,
      name: product.name,
      price: product.price,
      priceInRupees: (product.price / 100).toFixed(2),
    }));
  }

  addProduct(id: string, name: string, price: number) {
    this.products[id] = { name, price };
    this.logger.log(`Product added: ${id} - ${name} - ₹${(price / 100).toFixed(2)}`);
    return this.products[id];
  }

  removeProduct(id: string) {
    if (this.products[id]) {
      delete this.products[id];
      this.logger.log(`Product removed: ${id}`);
      return true;
    }
    return false;
  }

  updateProduct(id: string, updates: { name?: string; price?: number }) {
    if (this.products[id]) {
      if (updates.name) this.products[id].name = updates.name;
      if (updates.price) this.products[id].price = updates.price;
      this.logger.log(`Product updated: ${id}`);
      return this.products[id];
    }
    throw new Error(`Product not found: ${id}`);
  }
}