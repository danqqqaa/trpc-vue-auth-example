import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/user/user.model';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const requiredPermissions: ROLE[] = this.reflector.getAllAndOverride(
      'requiredPermission',
      [context.getHandler(), context.getClass()],
    );
    const request: any = context.switchToHttp().getRequest();

    return requiredPermissions.includes(request.user.role);
  }
}
