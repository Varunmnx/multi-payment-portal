/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  RawBodyRequest,
  Header,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { RazorpayService } from '../service/razorpay.service';
import { CreateRazorpayOrderDto } from '../dto/razorpay/create-payment.dto';
import { VerifyPaymentDto } from '../dto/razorpay/verify-payment.dto';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceEnvKeys } from '@/microserviceFactory.factory';
import * as crypto from "crypto"; 


@Controller('razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService, private readonly configService: ConfigService) { }

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
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return 'OK';
    }
    console.log("webhook_hit", request?.headers)
    console.log("webhook_hit.body", body)
    const signature = request.headers['x-razorpay-signature'] as string;
    const secret = this.configService.getOrThrow<string>(MicroserviceEnvKeys.RAZORPAY_WEBHOOK_SECRET); // Should match the one set in Razorpay dashboard

    if (!signature || !secret) {
      throw new Error('Missing webhook signature or secret');
    }

    // Get raw body (must be buffered as string)
    const rawBody = request.body?.toString()
    console.log('[Webhook] Received event:', body.event);
    if (!rawBody) {
      throw new Error('Empty raw body received');
    }
    const shasum = crypto.createHmac('sha256',secret);
    shasum.update(JSON.stringify(body));
    const digest = shasum.digest('hex');
    console.log("digest", digest) 
    console.log("signature", signature) 
    if(digest !== signature){
      throw new Error('Invalid signature');
    }
    console.log(")))))))VAlidated successfuly")

    // Process relevant events
    this.razorpayService.handleWebhookEvents(body);

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
   * Verification endpoint for frontend success callback
   * Called after payment success (from frontend) to double-check and finalize
   */
  @Post('verify')
  async verifyPayment(
    @Body(new ValidationPipe({ transform: true })) verifyPaymentDto: VerifyPaymentDto,
  ) {
    // console.log('[Verify] Verifying payment...',verifyPaymentDto);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentDto;
    /**
     * the hash of the razorpay_order_id, razorpay_payment_id and razorpay_signature
     * calculated by you on the server side.
     * order id is same as sent by the server it should match the razorpay signature generated to ensure same order id is been used
     */
    const isVerified = await this.razorpayService.verifyPayment(
      razorpay_signature,
      razorpay_order_id,
      razorpay_payment_id,
    );

    if (!isVerified) {
      throw new BadRequestException('Payment verification failed');
    }

    // Fetch payment details after successful verification
    const paymentDetails = await this.razorpayService.fetchPaymentDetails(razorpay_payment_id);

    // You can now safely update your backend state
    // console.log('[Verify] Payment successful:', paymentDetails);

    return {
      message: 'Payment verified successfully',
      paymentDetails,
    };
  }
}