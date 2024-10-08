import { PartialType } from '@nestjs/mapped-types';
import { CreateLoadingDto } from './create-loading.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLoadingDto extends PartialType(CreateLoadingDto) {
}
