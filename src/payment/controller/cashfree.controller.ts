import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CashFreeService } from '../service/cashfree.service';
import { CreateCashfreeOrderDto } from '../dto/cashfree/create-payment.dto';
import { CashFreeWebHookEventType } from '@/common/cashfree/webhook/web-hook.event.dto';

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
  async handleWebhook(@Body() webhookData: CashFreeWebHookEventType) {
    try {
      // Log the webhook data for debugging
      this.logger.log('Cashfree webhook received:', JSON.stringify(webhookData, null, 2));

      // Process the webhook data based on event type
      this.cashfreeService.handleWebHookEvents(webhookData);

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
}
