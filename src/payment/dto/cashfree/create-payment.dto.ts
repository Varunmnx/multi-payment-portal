import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCashfreeOrderDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  customerName: string;

  @IsNotEmpty()
  @IsString()
  customerEmail: string;

  @IsNotEmpty()
  @IsString()
  customerPhone: string;
}