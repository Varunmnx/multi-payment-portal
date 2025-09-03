/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  RawBodyRequest,
  Header,
} from '@nestjs/common';
import { Request } from 'express';
import { RazorpayService } from '../service/razorpay.service';
import { CreateRazorpayOrderDto } from '../dto/razorpay/create-payment.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  /**
   * Create a new Razorpay order
   */
  @Post('order')
  async createOrder(@Body(new ValidationPipe({ transform: true })) createOrderDto: CreateRazorpayOrderDto) {
    return this.razorpayService.createOrder(createOrderDto);
  }

  /**
   * Get available products/plans
   */
  @Get('products')
  async getProducts() {
    return this.razorpayService.getProducts();
  }

  /**
   * Handle Razorpay Webhook Events
   * Make sure to configure this route in Razorpay Dashboard:
   * https://dashboard.razorpay.com/#/app/webhooks
   *
   * This endpoint must be publicly accessible (use ngrok for testing locally).
   */
  @Post('webhook')
  @Header('Content-Type', 'text/plain') // Optional: helps avoid compression issues
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>, // Required to access raw body for signature verification
    @Body() body: any,
  ) {
    const signature = request.headers['x-razorpay-signature'] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Should match the one set in Razorpay dashboard

    if (!signature || !secret) {
      throw new Error('Missing webhook signature or secret');
    }

    // Get raw body (must be buffered as string)
    const rawBody = request.rawBody?.toString();

    if (!rawBody) {
      throw new Error('Empty raw body received');
    }

 

    console.log('[Webhook] Received event:', body.event);

    // Process relevant events
    switch (body.event) {
      case 'payment.captured':
        const payment = body.payload.payment.entity;
        console.log(`[Webhook] Payment captured: ${payment.id}, Order ID: ${payment.order_id}`);
        // TODO: Update your DB, mark order as paid, trigger email/invoice, etc.
        await this.handlePaymentCaptured(payment);
        break;

      case 'order.paid':
        console.log(`[Webhook] Order paid: ${body.payload.order.entity.id}`);
        // Optional: handle order-level logic
        break;

      case 'subscription.activated':
        console.log(`[Webhook] Subscription activated: ${body.payload.subscription.entity.id}`);
        // Handle subscription activation
        break;

      // Add more cases as needed: refund.created, payment.failed, etc.

      default:
        console.log(`[Webhook] Unhandled event type: ${body.event}`);
    }

    // Acknowledge receipt
    return 'Webhook processed';
  }

  /**
   * Optional: Handle payment captured logic (e.g., update DB)
   */
  private async handlePaymentCaptured(payment: any) {
    const { order_id, amount, currency, method } = payment;

    console.log(
      `Processing payment of ₹${(amount / 100).toFixed(2)} ${currency} via ${method} for order ${order_id}`,
    );

    // Example: Update database
    // await this.ordersService.updateByOrderId(order_id, { status: 'PAID', paymentId: payment.id });

    // Send confirmation email, generate invoice, unlock features, etc.
  }

  /**
   * Optional: Verification endpoint for frontend success callback
   * Called after payment success (from frontend) to double-check and finalize
   */
  @Post('verify')
  async verifyPayment(
    @Body() body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const isVerified = await this.razorpayService.verifyPayment(
      razorpay_signature,
      razorpay_order_id,
      razorpay_payment_id,
    );

    if (!isVerified) {
      throw new Error('Payment verification failed');
    }

    // Fetch payment details after successful verification
    const paymentDetails = await this.razorpayService.fetchPaymentDetails(razorpay_payment_id);

    // You can now safely update your backend state
    console.log('[Verify] Payment successful:', paymentDetails);

    return {
      message: 'Payment verified successfully',
      paymentDetails,
    };
  }
}