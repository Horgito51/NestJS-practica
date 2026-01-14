import {
    Injectable,
    ConflictException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PerformanceObserverEntryList } from 'node:perf_hooks';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }
    async register(registerDto: RegisterDto) {

        const exists = this.usersService.findByEmail(registerDto.email);
        if (exists) {
            throw new ConflictException('El correo ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = await this.usersService.create({
            nombre: `${registerDto.nombre} ${registerDto.apellido}`,
            email: registerDto.email,
            password: hashedPassword,
            isActive: true,
            role: 'user',
        });

        const token = this.jwtService.sign({ id: user.id, email: user.email });

        return {
            profile: this.getProfile(user.id),
            accessToken: token,
        };
    }

    async login(loginDto: LoginDto) {
        const exists = await this.usersService.findByEmail(loginDto.email);
        if (!exists) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(loginDto.password, exists.password);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const token = this.jwtService.sign({ id: exists.id, email: exists.email });

        return {
            message: 'Login exitoso',
            profile: this.getProfile(exists.id),
            accessToken: token,
        };
    }


    getProfile(userId: number) {
        // Buscar el usuario por ID
        const user = this.usersService.findById(userId);

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // Retornar datos del usuario sin la contraseña
        const { password, ...userWithoutPassword } = user;

        return {
            message: 'Perfil obtenido exitosamente',
            user: userWithoutPassword,
        };
    }
}
