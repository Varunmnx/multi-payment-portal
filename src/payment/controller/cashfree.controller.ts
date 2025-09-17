import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CashFreeService } from '../service/cashfree.service';
import { CreateCashfreeOrderDto } from '../dto/cashfree/create-payment.dto';

@Controller('cashfree')
export class CashfreeController {
  constructor(
    private readonly cashfreeService: CashFreeService,
    private readonly logger: Logger,
  ) {}

  @Get('products')
  getProducts() {
    try {
      return this.cashfreeService.getProducts();
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch products',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-order')
  async createOrder(@Body() createOrderDto: CreateCashfreeOrderDto) {
    try {
      const order = await this.cashfreeService.createOrder(createOrderDto);
      return order;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create order',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('order-status/:orderId')
  async getOrderStatus(@Param('orderId') orderId: string) {
    try {
      if (!orderId) {
        throw new HttpException(
          {
            success: false,
            message: 'Order ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const orderStatus = await this.cashfreeService.getOrderStatus(orderId);
      return orderStatus;
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch order status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() webhookData: any) {
    try {
      // Log the webhook data for debugging
      this.logger.log('Cashfree webhook received:', JSON.stringify(webhookData, null, 2));

      // Process the webhook data based on event type
      const { type, data } = webhookData;

      switch (type) {
        case 'PAYMENT_SUCCESS_WEBHOOK':
          // Handle successful payment
          this.logger.log('Payment successful for order:', data.order?.order_id);
          this.logger.log('Payment ID:', data.payment?.cf_payment_id);
          this.logger.log('Amount:', data.payment?.payment_amount);

          // Here you can update your database, send emails, etc.
          await this.handlePaymentSuccess(data);
          break;

        case 'PAYMENT_FAILED_WEBHOOK':
          // Handle failed payment
          this.logger.log('Payment failed for order:', data.order?.order_id);
          this.logger.log('Failure reason:', data.payment?.payment_message);

          await this.handlePaymentFailure(data);
          break;

        case 'PAYMENT_USER_DROPPED_WEBHOOK':
          // Handle user dropped/cancelled payment
          this.logger.log('Payment dropped by user for order:', data.order?.order_id);

          await this.handlePaymentCancellation(data);
          break;

        default:
          this.logger.log('Unhandled webhook event:', type);
      }

      // Always return success response to Cashfree
      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      this.logger.error('Webhook processing failed:', error);
      // Still return success to avoid webhook retries for processing errors
      return {
        success: true,
        message: 'Webhook received but processing failed',
      };
    }
  }

  private async handlePaymentSuccess(data: any) {
    try {
      const orderId = data.order?.order_id;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const paymentId = data.payment?.cf_payment_id;

      // Verify payment status
      const orderStatus = await this.cashfreeService.getOrderStatus(orderId);

      if (orderStatus.order_status === 'PAID') {
        this.logger.log(`Payment verified for order: ${orderId}`);
        // Add your business logic here:
        // - Update database
        // - Send confirmation email
        // - Activate subscription, etc.
        this.cashfreeService.sendSuccessfulPaymentEmailNotification(
          orderId,
          paymentId,
          data?.payment,
          data?.customer_details,
        );
      }
    } catch (error) {
      this.logger.error('Error processing payment success:', error);
    }
  }

  private async handlePaymentFailure(data: any) {
    try {
      const orderId = data.order?.order_id;

      this.logger.log(`Processing payment failure for order: ${orderId}`);
      // Add your failure handling logic here:
      // - Update database
      // - Send failure notification
      // - Log for analysis, etc.
    } catch (error) {
      this.logger.error('Error processing payment failure:', error);
    }
  }

  private async handlePaymentCancellation(data: any) {
    try {
      const orderId = data.order?.order_id;

      this.logger.log(`Processing payment cancellation for order: ${orderId}`);
      // Add your cancellation handling logic here:
      // - Update database
      // - Handle inventory, etc.
    } catch (error) {
      this.logger.error('Error processing payment cancellation:', error);
    }
  }
}
