import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AdminRole } from '../admin/admin.entity';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.type !== 'admin' || user.role !== AdminRole.OWNER) {
      throw new ForbiddenException('OWNER 권한이 필요합니다.');
    }

    return true;
  }
}
