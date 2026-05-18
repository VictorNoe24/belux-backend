import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ERROR_CODE } from '../constants/error-code.constant';
import { AppException } from '../exceptions/app.exception';
import { UsersService } from '../../modules/users/services/users.service';
import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const token = this.extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      throw new AppException({
        message: 'Authentication token is required',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODE.AUTH_TOKEN_REQUIRED,
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new AppException({
          message: 'Authenticated user was not found',
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODE.AUTH_USER_NOT_FOUND,
        });
      }

      request.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        statusId: user.statusId,
      };

      return true;
    } catch (error: unknown) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException({
        message: 'Invalid or expired authentication token',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ERROR_CODE.AUTH_TOKEN_INVALID,
      });
    }
  }

  private extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) {
      return null;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
