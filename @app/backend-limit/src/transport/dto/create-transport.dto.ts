import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTransportDto {
  @IsOptional()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  transportNumber: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNotEmpty()
  @IsInt()
  statusId: number;

  @IsNotEmpty()
  @IsInt()
  placeId: number;

  @IsNotEmpty()
  @IsInt()
  driverId: number;

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
  @IsBoolean()
  isLocal: boolean;

  @IsOptional()
  @IsString()
  agGUID: string;

  @IsOptional()
  @IsNumber()
  transportTypeId: number;
}
