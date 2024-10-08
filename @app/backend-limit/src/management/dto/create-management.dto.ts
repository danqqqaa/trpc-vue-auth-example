import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateManagementDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isMinutes?: boolean;

  @IsNotEmpty()
  @IsNumber()
  bossId: number;

  @IsNotEmpty()
  @IsNumber()
  defaultLimit: number;

  @IsOptional()
  @IsNumber()
  operatingSpeedVariable: number;
}
