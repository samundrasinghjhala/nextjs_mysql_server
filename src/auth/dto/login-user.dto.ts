import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class LoginUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    isAdmin: boolean;
}