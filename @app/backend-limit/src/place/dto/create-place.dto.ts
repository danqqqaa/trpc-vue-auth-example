import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePlaceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNotEmpty()
  @IsString()
  startTimeWork: Date;

  @IsNotEmpty()
  @IsString()
  endTimeWork: Date;

  @IsOptional()
  @IsString()
  startTimeLunch: Date;

  @IsNotEmpty()
  @IsString()
  endTimeLunch: Date;

  @IsArray()
  transportTypes: Array<any>;
}
