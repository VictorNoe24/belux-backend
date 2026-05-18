import { HttpException, HttpStatus } from '@nestjs/common';

import { ERROR_CODE, ErrorCode } from '../constants/error-code.constant';

export interface AppExceptionOptions {
  message: string;
  statusCode: HttpStatus;
  code: ErrorCode;
  details?: unknown;
  source?: string;
}

export interface AppExceptionResponse {
  message: string;
  code: ErrorCode;
  details: unknown;
  source: string;
}

export class AppException extends HttpException {
  constructor(options: AppExceptionOptions) {
    super(
      {
        message: options.message,
        code: options.code,
        details: options.details ?? null,
        source: options.source ?? 'application',
      } satisfies AppExceptionResponse,
      options.statusCode,
    );
  }

  static internalServerError(details?: unknown): AppException {
    return new AppException({
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODE.INTERNAL_SERVER_ERROR,
      details,
    });
  }
}
