import { IsNotEmpty, IsEmail, IsString, IsOptional, IsUUID } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateUserDto {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    isAdmin: boolean;

    @IsOptional()
    @IsString()
    pfxPath?: string;
}