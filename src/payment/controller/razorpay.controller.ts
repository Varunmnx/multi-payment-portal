import { Controller, Post, Body, Get, UsePipes, ValidationPipe } from '@nestjs/common';
import { RazorpayService } from '../service/razorpay.service';
import { CreateRazorpayOrderDto } from '../dto/razorpay/create-payment.dto';

@Controller('razorpay')
export class RazorpayController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Post('order')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(@Body() createOrderDto: CreateRazorpayOrderDto) {
    return this.razorpayService.createOrder(createOrderDto);
  }

  @Get('products')
  async getProducts() {
    return this.razorpayService.getProducts();
  }
}