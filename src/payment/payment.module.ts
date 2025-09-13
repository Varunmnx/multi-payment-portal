import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RazorpayController } from './controller/razorpay.controller';
import { CashfreeController } from './controller/cashfree.controller';
import { RazorpayService } from './service/razorpay.service';
import { CashFreeService } from './service/cashfree.service';
import { PaymentManager } from './payment-manager';
import { EmailModule } from '@/common/email/email.module';

@Module({
  imports: [HttpModule, EmailModule],
  controllers: [RazorpayController, CashfreeController],
  providers: [RazorpayService, CashFreeService, PaymentManager, Logger],
  exports: [PaymentManager],
})
export class PaymentModule {}
