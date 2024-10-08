import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateLimitRequestDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}