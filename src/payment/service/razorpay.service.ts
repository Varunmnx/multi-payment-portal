/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from "@nestjs/common";
import Razorpay from "razorpay";
import { CreateRazorpayOrderDto } from "../dto/razorpay/create-payment.dto";
import * as crypto from "crypto";

@Injectable()
export class RazorpayService {
  private razorpayInstance: Razorpay;

  constructor() {
    // Initialize Razorpay with credentials from environment variables.
    // Ensure RAZORPAY_API_KEY_ID and RAZORPAY_API_KEY_SECRET are configured.
    if (!process.env.RAZORPAY_API_KEY_ID || !process.env.RAZORPAY_API_KEY_SECRET) {
      throw new Error("Missing Razorpay credentials. Please set RAZORPAY_API_KEY_ID and RAZORPAY_API_KEY_SECRET.");
    }

    this.razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY_ID,
      key_secret: process.env.RAZORPAY_API_KEY_SECRET,
    });
  }

  // Sample product and prices manager
  private products = {
    "product_1": { name: "Basic Plan", price: 1000 }, // ₹10.00
    "product_2": { name: "Premium Plan", price: 5000 }, // ₹50.00
    "product_3": { name: "Enterprise Plan", price: 10000 }, // ₹100.00
  };

  /**
   * Creates a new Razorpay order.
   * @param createOrderDto The DTO containing order details.
   * @returns The created Razorpay order object.
   */
  async createOrder(createOrderDto: CreateRazorpayOrderDto) {
    const { amount, currency, productId } = createOrderDto;

    // Validate product ID. Use a proper exception for better API responses.
    if (!this.products[productId]) {
      throw new BadRequestException("Invalid product ID");
    }

    // If amount is not provided, use the product's default price.
    const orderAmount = amount || this.products[productId].price;

    const options = {
      amount: orderAmount, // Razorpay expects amount in paise, so we use the raw value from our product list.
      currency: currency || "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    try {
      const order = await this.razorpayInstance.orders.create(options);
      return {
        ...order,
        product: this.products[productId],
        productId: productId,
      };
    } catch (error) {
      // Log the full error object for detailed debugging.
      console.error("Razorpay order creation failed with an unexpected error:", error);
      
      // Improved error handling: check if error.message exists.
      const errorMessage = error.message || "An unknown error occurred during Razorpay order creation.";
      throw new BadRequestException(`Razorpay order creation failed: ${errorMessage}`);
    }
  }

  /**
   * Verifies a Razorpay payment signature.
   * This is the crucial security fix. It ensures the payment is authentic.
   * @param signature The payment signature received from Razorpay.
   * @param orderId The order ID associated with the payment.
   * @param paymentId The payment ID.
   * @returns A boolean indicating whether the verification was successful.
   */
  async verifyPayment(signature: string, orderId: string, paymentId: string): Promise<boolean> {
    try {
      // Create a Hmac SHA256 hash using the order ID, payment ID, and the API secret.
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_API_KEY_SECRET);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest("hex");
      
      // Compare the generated signature with the signature provided by Razorpay.
      return generatedSignature === signature;
    } catch (error) {
      console.error("Payment verification failed:", error.message);
      return false;
    }
  }

  /**
   * Fetches the details of a specific payment from Razorpay.
   * This is useful after successful verification to get transaction details.
   * @param paymentId The ID of the payment to fetch.
   * @returns The payment object.
   */
  async fetchPaymentDetails(paymentId: string) {
    try {
      return await this.razorpayInstance.payments.fetch(paymentId);
    } catch (error) {
      throw new BadRequestException(`Failed to fetch payment details: ${error.message}`);
    }
  }

  /**
   * Returns the list of available products.
   * @returns A list of products.
   */
  getProducts() {
    return this.products;
  }
}
