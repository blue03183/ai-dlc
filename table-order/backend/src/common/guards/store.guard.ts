import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * 멀티테넌트 Guard: JWT의 storeId와 요청 경로의 storeId 일치 검증
 */
@Injectable()
export class StoreGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const paramStoreId = Number(request.params.storeId);

    if (!user || !paramStoreId) {
      return true; // 인증이 필요 없는 경로
    }

    if (user.storeId !== paramStoreId) {
      throw new ForbiddenException('해당 매장에 대한 접근 권한이 없습니다.');
    }

    return true;
  }
}
