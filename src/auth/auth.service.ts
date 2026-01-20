import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  const user = await this.usersService.findByEmail(loginDto.email);
  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(loginDto.password, user.password);
  if (!isMatch) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const token = this.jwtService.sign({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
  });

  return {
    message: 'Login exitoso',
    profile: await this.getProfile(user.id),
    accessToken: token,
  };
}



async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;

    return {
        message: 'Perfil obtenido exitosamente',
        user: userWithoutPassword,
    };
}

}
