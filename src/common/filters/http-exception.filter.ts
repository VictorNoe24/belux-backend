import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

import { ERROR_CODE, ErrorCode } from '../constants/error-code.constant';

interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: {
    code: ErrorCode;
    details: unknown;
    source: string;
  };
}

interface NormalizedErrorResponse {
  statusCode?: number;
  message: string;
  code: ErrorCode;
  details: unknown;
  source: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const normalizedResponse = this.normalizePrismaKnownRequestError(exception);

      response.status(normalizedResponse.statusCode).json({
        success: false,
        statusCode: normalizedResponse.statusCode,
        message: normalizedResponse.message,
        error: {
          code: normalizedResponse.code,
          details: normalizedResponse.details,
          source: normalizedResponse.source,
        },
      } satisfies ApiErrorResponse);

      return;
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Database validation failed',
        error: {
          code: ERROR_CODE.DATABASE_VALIDATION_ERROR,
          details: exception.message,
          source: 'database',
        },
      } satisfies ApiErrorResponse);

      return;
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Database connection failed',
        error: {
          code: ERROR_CODE.DATABASE_CONNECTION_ERROR,
          details: exception.message,
          source: 'database',
        },
      } satisfies ApiErrorResponse);

      return;
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const normalizedResponse = this.normalizeHttpException(exception);

      response.status(statusCode).json({
        success: false,
        statusCode,
        message: normalizedResponse.message,
        error: {
          code: normalizedResponse.code,
          details: normalizedResponse.details,
          source: normalizedResponse.source,
        },
      } satisfies ApiErrorResponse);

      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: {
        code: ERROR_CODE.INTERNAL_SERVER_ERROR,
        details: null,
        source: 'application',
      },
    } satisfies ApiErrorResponse);
  }

  private normalizePrismaKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): Required<NormalizedErrorResponse> {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with the same unique value already exists',
          code: ERROR_CODE.DATABASE_UNIQUE_CONSTRAINT,
          details: this.extractPrismaMeta(exception.meta),
          source: 'database',
        } satisfies Required<NormalizedErrorResponse>;
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'The requested record was not found',
          code: ERROR_CODE.DATABASE_RECORD_NOT_FOUND,
          details: this.extractPrismaMeta(exception.meta),
          source: 'database',
        } satisfies Required<NormalizedErrorResponse>;
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Database query failed',
          code: ERROR_CODE.DATABASE_QUERY_ERROR,
          details: {
            prismaCode: exception.code,
            meta: this.extractPrismaMeta(exception.meta),
          },
          source: 'database',
        } satisfies Required<NormalizedErrorResponse>;
    }
  }

  private normalizeHttpException(exception: HttpException): NormalizedErrorResponse {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
        code: ERROR_CODE.HTTP_EXCEPTION,
        details: null,
        source: 'application',
      };
    }

    const payload = this.toExceptionPayload(exceptionResponse);
    const message = this.getMessageFromPayload(payload);
    const details = this.getDetailsFromPayload(payload);

    return {
      message,
      code: this.getCodeFromPayload(payload, details),
      details,
      source: this.getSourceFromPayload(payload),
    };
  }

  private getMessageFromPayload(payload: ExceptionPayload): string {
    const { message } = payload;

    if (Array.isArray(message)) {
      return 'Validation failed';
    }

    if (typeof message === 'string') {
      return message;
    }

    return 'Request failed';
  }

  private getDetailsFromPayload(payload: ExceptionPayload): unknown {
    const { message, details, error } = payload;

    if (Array.isArray(message)) {
      return message.every((item) => typeof item === 'string') ? message : null;
    }

    if (details !== undefined) {
      return details;
    }

    if (typeof error === 'string') {
      return error;
    }

    return null;
  }

  private getCodeFromPayload(payload: ExceptionPayload, details: unknown): ErrorCode {
    if (typeof payload.code === 'string') {
      return payload.code as ErrorCode;
    }

    if (Array.isArray(details)) {
      return ERROR_CODE.VALIDATION_ERROR;
    }

    return ERROR_CODE.HTTP_EXCEPTION;
  }

  private getSourceFromPayload(payload: ExceptionPayload): string {
    if (typeof payload.source === 'string' && payload.source.length > 0) {
      return payload.source;
    }

    return 'application';
  }

  private toExceptionPayload(exceptionResponse: unknown): ExceptionPayload {
    if (!this.isRecord(exceptionResponse)) {
      return {};
    }

    const message: unknown = exceptionResponse['message'];
    const error: unknown = exceptionResponse['error'];
    const code: unknown = exceptionResponse['code'];
    const details: unknown = exceptionResponse['details'];
    const source: unknown = exceptionResponse['source'];

    return {
      message,
      error,
      code,
      details,
      source,
    };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private extractPrismaMeta(meta: Prisma.PrismaClientKnownRequestError['meta']): unknown {
    if (!meta || !this.isRecord(meta)) {
      return null;
    }

    return Object.fromEntries(Object.entries(meta));
  }
}

interface ExceptionPayload {
  message?: unknown;
  error?: unknown;
  code?: unknown;
  details?: unknown;
  source?: unknown;
}
