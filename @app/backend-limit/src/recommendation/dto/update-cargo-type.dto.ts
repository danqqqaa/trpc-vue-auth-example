import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoTypeDto } from './create-cargo-type.dto';

export class UpdateCargoTypeDto extends PartialType(CreateCargoTypeDto) {}
