import { IsBoolean, IsOptional } from "class-validator";

export class ChangeLimitRequestStatusDto {
    @IsOptional()
    @IsBoolean()
    approved: boolean;

    @IsOptional()
    @IsBoolean()
    declined: boolean;
}