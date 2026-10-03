import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
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
    const { passwordHash, passwordSalt } = await hashPassword(dto.password!);
    const user = await this.users.save({
      email: dto.email!,
      passwordHash,
      passwordSalt,
      name: dto.name!,
      phone: dto.phone,
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
    if (!(await verifyPassword(dto.password!, user.passwordHash!, user.passwordSalt!))) {
      throw new UnauthorizedException('Password incorrecto');
    }
    const claims = { sub: user.id!, email: user.email! };
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
      { sub: payload.sub, email: payload.email, type: 'access' },
      ACCESS_TTL,
    );
    return { accessToken };
  }

  async getProfile(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { passwordHash, passwordSalt, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updateData: {
      email?: string;
      passwordHash?: string;
      passwordSalt?: string;
      name?: string;
    } = {};

    if (dto.email) {
      const existing = await this.users.findByEmail(dto.email);
      if (existing && Number(existing.id) !== userId) {
        throw new BadRequestException('El correo ya está en uso por otro usuario');
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      Object.assign(updateData, await hashPassword(dto.password));
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
}

// scrypt con una sal aleatoria por usuario. La sal se guarda en su propia
// columna (password_salt) y el hash en password_hash, ambos en hex.
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;
const SALT_BYTES = 16; // 32 caracteres hex -> CHAR(32)
const HASH_BYTES = 64; // 128 caracteres hex -> CHAR(128)

async function hashPassword(
  password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const passwordSalt = randomBytes(SALT_BYTES).toString('hex');
  const hash = await scryptAsync(password, passwordSalt, HASH_BYTES);
  return { passwordHash: hash.toString('hex'), passwordSalt };
}

async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
): Promise<boolean> {
  const hash = await scryptAsync(password, salt, HASH_BYTES);
  const stored = Buffer.from(storedHash, 'hex');
  return stored.length === hash.length && timingSafeEqual(stored, hash);
}
