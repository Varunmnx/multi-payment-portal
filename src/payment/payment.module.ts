import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RazorpayController } from './controller/razorpay.controller';
import { CashfreeController } from './controller/cashfree.controller';
import { RazorpayService } from './service/razorpay.service';
import { CashFreeService } from './service/cashfree.service';
import { PaymentManager } from './payment-manager';

@Module({
  imports: [HttpModule],
  controllers: [RazorpayController, CashfreeController],
  providers: [RazorpayService, CashFreeService, PaymentManager, Logger],
  exports: [PaymentManager],
})
export class PaymentModule {}
