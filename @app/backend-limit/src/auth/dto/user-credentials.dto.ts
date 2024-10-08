import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserCredentialsDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  fcmToken: string;

  @IsOptional()
  @IsString()
  version: string;
}
