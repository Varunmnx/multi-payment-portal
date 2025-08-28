import { Controller, Post, Body, Get } from '@nestjs/common';
import { CashFreeService } from '../service/cashfree.service';
import { CreateCashfreeOrderDto } from '../dto/cashfree/create-payment.dto';

@Controller('cashfree')
export class CashFreeController {
  constructor(private readonly cashFreeService: CashFreeService) {}

  @Post('order')
  async createOrder(@Body() createOrderDto: CreateCashfreeOrderDto) {
    return this.cashFreeService.createOrder(createOrderDto);
  }

  @Get('products')
  async getProducts() {
    return this.cashFreeService.getProducts();
  }
}