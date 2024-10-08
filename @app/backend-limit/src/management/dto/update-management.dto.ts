import { PartialType } from '@nestjs/mapped-types';
import { CreateManagementDto } from './create-management.dto';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
export class UpdateManagementDto extends PartialType(CreateManagementDto) {
    @IsOptional()
    @IsString()
    subdivision: string;

    @IsOptional()
    @IsBoolean()
    isSubdivision: boolean;
}
