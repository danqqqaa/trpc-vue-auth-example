import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ROLE } from '../user.model';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsNotEmpty()
  @IsString()
  middlename: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(ROLE)
  role: ROLE;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  workingPhoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  isOnDriverShift?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnLunch?: boolean;

  @IsOptional()
  @IsDate()
  onLunchSince?: Date;
}
