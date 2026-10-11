import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { sign, verify } from './jwt';
import { UsersRepository } from './users.repository';

const ACCESS_TTL = 15 * 60; // 15 minutos
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 días

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersRepository) {}

  async register(dto: RegisterDto): Promise<{ id: number; email: string }> {
    if (await this.users.findByEmail(dto.email!)) {
      throw new ConflictException('El email ya está registrado');
    }
    const user = await this.users.save({
      email: dto.email!,
      passwordHash: hash(dto.password!),
      name: dto.name!,
      role_Id: 2,
    });
    return { id: Number(user.id), email: user.email! };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.users.findByEmail(dto.email!);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }
    if (user.passwordHash !== hash(dto.password!)) {
      throw new UnauthorizedException('Password incorrecto');
    }
    const claims = { sub: user.id!, email: user.email!, role_id: Number(user.role_id!) };
    const accessToken = sign({ ...claims, type: 'access' }, ACCESS_TTL);
    const refreshToken = sign({ ...claims, type: 'refresh' }, REFRESH_TTL);
    return { accessToken, refreshToken };
  }

  refresh(dto: RefreshDto): { accessToken: string } {
    const payload = verify(dto.refreshToken!);
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const accessToken = sign(
      { sub: payload.sub, email: payload.email, role_id: payload.role_id, type: 'access' },
      ACCESS_TTL,
    );
    return { accessToken };
  }

  async getProfile(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updateData: { email?: string; passwordHash?: string; name?: string } = {};

    if (dto.email) {
      const existing = await this.users.findByEmail(dto.email);
      if (existing && Number(existing.id) !== userId) {
        throw new BadRequestException('El correo ya está en uso por otro usuario');
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.passwordHash = hash(dto.password);
    }

    if (dto.name) updateData.name = dto.name;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    await this.users.update(userId, updateData);
    return { message: 'Perfil actualizado con éxito' };
  }

  async deleteAccount(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.users.delete(userId);
    return { message: 'Cuenta eliminada exitosamente' };
  }


  async findAllUsers() {
    const usersList = await this.users.findAll();
    return usersList.map((u) => ({
      id: Number(u.id),
      email: u.email,
      name: u.name,
      role: Number(u.role_id) === 1 ? 'ADMIN' : 'USER',
    }));
  }

  async updateUserRole(userId: number, roleStr: string) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario #${userId} no encontrado`);
    }

    const roleId = roleStr.toUpperCase() === 'ADMIN' ? 1 : 2;
    await this.users.updateRole(userId, roleId);

    return {
      id: Number(user.id),
      email: user.email,
      role: roleId === 1 ? 'ADMIN' : 'USER',
    };
  }
}

function hash(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}