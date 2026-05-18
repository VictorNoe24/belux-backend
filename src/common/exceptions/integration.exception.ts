import { HttpStatus } from '@nestjs/common';

import { ERROR_CODE } from '../constants/error-code.constant';
import { AppException } from './app.exception';

export interface IntegrationExceptionOptions {
  message: string;
  integration: string;
  statusCode?: HttpStatus;
  details?: unknown;
}

export class IntegrationException extends AppException {
  constructor(options: IntegrationExceptionOptions) {
    super({
      message: options.message,
      statusCode: options.statusCode ?? HttpStatus.BAD_GATEWAY,
      code: ERROR_CODE.INTEGRATION_ERROR,
      details: options.details ?? null,
      source: options.integration,
    });
  }
}
