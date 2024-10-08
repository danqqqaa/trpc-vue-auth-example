import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsDate()
  orderTime: Date;

  @IsNotEmpty()
  @IsString()
  departurePointName: string;

  @IsNotEmpty()
  @IsString()
  destinationName: string;

  @IsNotEmpty()
  @IsBoolean()
  isEmergency: boolean;

  @IsNotEmpty()
  @IsInt()
  passengerCount: number;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  length: number;

  @IsNotEmpty()
  @IsNumber()
  width: number;

  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  cargoTypeId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  customerPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  customerFullname: string;

  @IsNotEmpty()
  @IsString()
  customerSubdivision: string;

  @IsNotEmpty()
  @IsString()
  contactPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  contactFullname: string;

  @IsNotEmpty()
  @IsInt()
  transportId: number;

  @IsOptional()
  @IsInt()
  parentOrder: number;

  @IsOptional()
  @IsBoolean()
  isParent: boolean;
}
