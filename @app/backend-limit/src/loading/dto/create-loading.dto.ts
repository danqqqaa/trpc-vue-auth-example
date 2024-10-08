import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateLoadingDto {
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

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
