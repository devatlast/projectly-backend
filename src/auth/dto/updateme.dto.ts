import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';


export class UpdateMeDto {
    @IsOptional()
    @IsString()
    @MinLength(4)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    password?: string;
}