import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { log } from 'console';
import { Request } from 'express';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(`No token`);
    }

    try {
      const payload: { id: number; email: string; type: string } =
        await this.jwtService.verifyAsync(token);

      const userRole = await this.userRoleRepository.findOne({
        where: {
          user: { id: payload.id },
        },
        relations: {
          role: true,
        },
      });

      const roleName = userRole?.role.name;

      request.headers['id'] = payload.id.toString();
      request.headers['email'] = payload.email;
      request.headers['role'] = roleName?.toString();
    } catch {
      throw new UnauthorizedException(`Not authorized`);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
