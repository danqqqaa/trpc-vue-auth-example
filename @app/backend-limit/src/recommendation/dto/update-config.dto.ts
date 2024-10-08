import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional()
  @IsBoolean()
  autoTransport: boolean;
}
