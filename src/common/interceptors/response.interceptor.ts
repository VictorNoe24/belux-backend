import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

import { RESPONSE_MESSAGE_METADATA } from '../constants/response-message.constant';

interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<{ url: string }>();
    const response = httpContext.getResponse<{ statusCode: number }>();
    const customMessage =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_METADATA, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Request successful';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: customMessage,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
