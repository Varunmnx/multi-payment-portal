import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailTemplateFactory } from './email.template.factory';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailTemplateFactory],
  exports: [EmailService],
})
export class EmailModule {}
