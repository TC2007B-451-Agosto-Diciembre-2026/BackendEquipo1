import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { Role } from "./roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || user.role_id === undefined) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción');
    }

    const hasRole = requiredRoles.includes(user.role_id);
    if (!hasRole) {
      throw new ForbiddenException('Acceso denegado: permisos insuficientes');
    }

    return true;
  }
}
