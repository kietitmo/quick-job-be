import {
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/IsPublic.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      // Kiểm tra nếu thông tin lỗi bao gồm mã lỗi 'TokenExpiredError'
      if (info && info.name === 'TokenExpiredError') {
        throw new HttpException('Token expired', 419);
      }
      // Nếu không phải lỗi hết hạn token, hoặc không có user, ném ra UnauthorizedException
      throw new UnauthorizedException();
    }
    return user;
  }
}
