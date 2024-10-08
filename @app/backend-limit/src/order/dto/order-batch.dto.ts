import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class OrderBatchDto {
  @IsOptional()
  @IsDate()
  orderTime: Date;

  @IsNotEmpty()
  @IsString()
  departurePointName: string;

  @IsNotEmpty()
  @IsBoolean()
  isEmergency: boolean;

  @IsNotEmpty()
  @IsInt()
  transportId: number;

  @IsNotEmpty()
  @IsString()
  customerPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  customerFullname: string;

  @IsNotEmpty()
  @IsString()
  customerSubdivision: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRequest?: boolean;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeclined?: boolean;

  @IsOptional()
  @IsString()
  customermvz: string;

  @IsOptional()
  @IsString()
  comment: string;

  elements: OrderBatchElementDto[];
}

export class OrderBatchElementDto {
  @IsNotEmpty()
  @IsString()
  destinationName: string;

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
  @IsBoolean()
  withCargoTypeRequest: boolean;

  @IsNotEmpty()
  @IsBoolean()
  isNew: boolean;

  @IsNotEmpty()
  @IsString()
  contactPhoneNumber: string;

  @IsNotEmpty()
  @IsString()
  contactFullname: string;

  @IsOptional()
  @IsString()
  cargoRecieverPhoneNumber: string;

  @IsOptional()
  @IsString()
  cargoRecieverFullname: string;

  @IsNotEmpty()
  @IsString()
  cargoRecieverSubdivision: string;

  @IsOptional()
  @IsString()
  cargoRecievermvz: string;

  @IsOptional()
  @IsNumber()
  existingId: number;

  @IsOptional()
  @IsBoolean()
  forDelete: boolean;

  @IsNotEmpty()
  @IsNumber()
  scenario: number;
}
