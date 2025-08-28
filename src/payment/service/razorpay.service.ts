/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import Razorpay from "razorpay";
import { CreateRazorpayOrderDto } from "../dto/razorpay/create-payment.dto";

@Injectable()
export class RazorpayService {
  private razorpayInstance: Razorpay;

  constructor() {
    // Initialize Razorpay with placeholder credentials
    // In a real application, these should come from environment variables
    this.razorpayInstance = new Razorpay({
      key_id: "your_razorpay_key_id", // process.env.RAZORPAY_KEY_ID
      key_secret: "your_razorpay_key_secret", // process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Sample product and prices manager
  private products = {
    "product_1": { name: "Basic Plan", price: 1000 }, // ₹10.00
    "product_2": { name: "Premium Plan", price: 5000 }, // ₹50.00
    "product_3": { name: "Enterprise Plan", price: 10000 }, // ₹100.00
  };

  async createOrder(createOrderDto: CreateRazorpayOrderDto) {
    const { amount, currency, productId } = createOrderDto;

    // Validate product
    if (!this.products[productId]) {
      throw new Error("Invalid product ID");
    }

    // If amount is not provided, use the product price
    const orderAmount = amount || this.products[productId].price;

    const options = {
      amount: orderAmount * 100, // Razorpay expects amount in paise
      currency: currency || "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    try {
      const order = await this.razorpayInstance.orders.create(options);
      return {
        ...order,
        product: this.products[productId],
        productId: productId
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    try {
      return await this.razorpayInstance.payments.fetch(paymentId);
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  getProducts() {
    return this.products;
  }
}