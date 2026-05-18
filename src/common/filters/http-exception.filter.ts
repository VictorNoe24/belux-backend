import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: string | string[] | null;
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const normalizedResponse =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse, error: null }
          : {
              message: this.getMessage(exceptionResponse),
              error: this.getError(exceptionResponse),
            };

      response.status(statusCode).json({
        success: false,
        statusCode,
        message: normalizedResponse.message,
        error: normalizedResponse.error,
        timestamp: new Date().toISOString(),
        path: request.url,
      } satisfies ApiErrorResponse);

      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    } satisfies ApiErrorResponse);
  }

  private getMessage(exceptionResponse: object): string {
    const { message } = this.toExceptionPayload(exceptionResponse);

    if (Array.isArray(message)) {
      return 'Validation failed';
    }

    if (typeof message === 'string') {
      return message;
    }

    return 'Request failed';
  }

  private getError(exceptionResponse: object): string | string[] | null {
    const { message, error } = this.toExceptionPayload(exceptionResponse);

    if (Array.isArray(message)) {
      return message.every((item) => typeof item === 'string') ? message : null;
    }

    if (typeof error === 'string') {
      return error;
    }

    return null;
  }

  private toExceptionPayload(exceptionResponse: unknown): { message?: unknown; error?: unknown } {
    if (!this.isRecord(exceptionResponse)) {
      return {};
    }

    const message: unknown = exceptionResponse['message'];
    const error: unknown = exceptionResponse['error'];

    return {
      message,
      error,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
