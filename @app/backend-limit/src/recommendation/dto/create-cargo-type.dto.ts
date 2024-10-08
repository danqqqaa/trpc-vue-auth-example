import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCargoTypeDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  priority: number;

  @IsOptional()
  @IsBoolean()
  isRequest: boolean;

  @IsNotEmpty()
  @IsBoolean()
  withEmergency: boolean;

  @IsNotEmpty()
  @IsBoolean()
  ignoreInRecommendation: boolean;
}
