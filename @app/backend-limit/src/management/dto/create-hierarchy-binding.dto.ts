import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateHierarchyBindingDto {
    @IsNotEmpty()
    @IsNumber()
    ownerId: number;
    
    @IsNotEmpty()
    @IsNumber()
    monthPlanLimit: number;
}