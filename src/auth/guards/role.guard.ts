import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const role = request.headers['role'] as string;

    if (!role) {
      throw new ForbiddenException('Role does not provided');
    }

    console.log(role);
    console.log(typeof role);

    console.log(requiredRoles);

    for (let i = 0; i < requiredRoles.length; i++) {
      if (requiredRoles[i] === role) return true;
    }

    return false;
  }
}
