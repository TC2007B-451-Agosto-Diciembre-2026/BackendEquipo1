import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['ADMIN', 'USER'], { message: 'El rol debe ser "ADMIN" o "USER"' })
  role!: string;
}
