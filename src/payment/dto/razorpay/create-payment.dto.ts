import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRazorpayOrderDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  productId: string;
}