import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  contactPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  contactFullname: string;

  @IsOptional()
  @IsInt()
  parentOrder: number;

  @IsOptional()
  @IsBoolean()
  isParent: boolean;
}
