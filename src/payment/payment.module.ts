import { Module } from '@nestjs/common';
import { RazorpayController } from './controller/razorpay.controller';
import { CashFreeController } from './controller/cashfree.controller';
import { RazorpayService } from './service/razorpay.service';
import { CashFreeService } from './service/cashfree.service';
import { PaymentManager } from './payment-manager';

@Module({
  imports: [],
  controllers: [RazorpayController, CashFreeController],
  providers: [RazorpayService, CashFreeService, PaymentManager],
  exports: [PaymentManager],
})
export class PaymentModule {}