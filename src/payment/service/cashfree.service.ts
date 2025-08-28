/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { Cashfree } from "cashfree-sdk";
import { CreateCashfreeOrderDto } from "../dto/cashfree/create-payment.dto";

@Injectable()
export class CashFreeService {
  private cashfreeInstance: Cashfree;

  constructor() {
    // Initialize Cashfree with placeholder credentials
    // In a real application, these should come from environment variables
    this.cashfreeInstance = new Cashfree({
      clientId: "your_cashfree_client_id", // process.env.CASHFREE_CLIENT_ID
      clientSecret: "your_cashfree_client_secret", // process.env.CASHFREE_CLIENT_SECRET
      environment: "SANDBOX", // or "PRODUCTION"
    });
  }

  // Sample product and prices manager
  private products = {
    "product_1": { name: "Basic Plan", price: 1000 }, // ₹10.00
    "product_2": { name: "Premium Plan", price: 5000 }, // ₹50.00
    "product_3": { name: "Enterprise Plan", price: 10000 }, // ₹100.00
  };

  async createOrder(createOrderDto: CreateCashfreeOrderDto) {
    const { productId, customerName, customerEmail, customerPhone } = createOrderDto;

    // Validate product
    if (!this.products[productId]) {
      throw new Error("Invalid product ID");
    }

    const product = this.products[productId];
    const orderId = `order_${Date.now()}`;

    const orderRequest = {
      order_id: orderId,
      order_amount: product.price,
      order_currency: "INR",
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: "https://example.com/return",
      },
    };

    try {
      const response = await this.cashfreeInstance.PGCreateOrder("2023-08-01", orderRequest);
      return {
        ...response.data,
        product: product,
        productId: productId
      };
    } catch (error) {
      throw new Error(`Cashfree order creation failed: ${error.message}`);
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const response = await this.cashfreeInstance.PGFetchOrder("2023-08-01", orderId);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch order status: ${error.message}`);
    }
  }

  getProducts() {
    return this.products;
  }
}