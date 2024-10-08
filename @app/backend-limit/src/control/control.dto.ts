import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateControlDto {
  @IsOptional()
  @IsNumber()
  productionPlanVolume?: number;

  @IsOptional()
  @IsNumber()
  productionFactVolume: number;

  @IsOptional()
  @IsNumber()
  realizationByHours: number;

  @IsOptional()
  @IsNumber()
  discount: number;

  @IsOptional()
  @IsNumber()
  fixedCost: number;

  @IsOptional()
  @IsNumber()
  veriableCost: number;
}
