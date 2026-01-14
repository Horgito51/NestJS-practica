import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';

export class RegisterDto {

    @IsString()
    @MaxLength(50)
    nombre: string;

    @IsString()
    @MaxLength(50)
    apellido: string;

    @IsEmail()
    @MaxLength(255)

    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}
