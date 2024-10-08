import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransportTypeDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsNumber()
  length: number;

  @IsOptional()
  @IsNumber()
  width: number;

  @IsOptional()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  passengerSeats: number;
}
