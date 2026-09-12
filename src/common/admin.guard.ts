import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-admin-key'];
    const expected = process.env.ADMIN_PASSWORD ?? 'loscuervos-admin';

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Contraseña de administrador incorrecta.');
    }
    return true;
  }
}
