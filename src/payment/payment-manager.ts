import { Injectable } from '@nestjs/common';
import { RazorpayService } from './service/razorpay.service';
import { CashFreeService } from './service/cashfree.service';

@Injectable()
export class PaymentManager {
  // Sample product and prices manager
  private products = {
    "product_1": { id: "product_1", name: "Basic Plan", price: 1000, description: "Basic features" }, // ₹10.00
    "product_2": { id: "product_2", name: "Premium Plan", price: 5000, description: "Advanced features" }, // ₹50.00
    "product_3": { id: "product_3", name: "Enterprise Plan", price: 10000, description: "All features" }, // ₹100.00
  };

  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly cashfreeService: CashFreeService
  ) {}

  getProduct(productId: string) {
    return this.products[productId];
  }

  getAllProducts() {
    return this.products;
  }

  async processRazorpayPayment(productId: string, currency: string = "INR") {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error("Invalid product ID");
    }

    return this.razorpayService.createOrder({
      amount: product.price,
      currency,
      productId
    });
  }

  async processCashfreePayment(productId: string, customerDetails: { name: string, email: string, phone: string }) {
    const product = this.getProduct(productId);
    if (!product) {
      throw new Error("Invalid product ID");
    }

    return this.cashfreeService.createOrder({
      productId,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      customerPhone: customerDetails.phone
    });
  }
}