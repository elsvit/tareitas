import { t } from '~/services';
import { IError } from '~/types/IError';

import { ApiError } from './client';

function readErrorCode(error: ApiError): string {
  if (
    typeof error.body === 'object' &&
    error.body !== null &&
    'errorCode' in error.body &&
    typeof error.body.errorCode === 'string'
  ) {
    return error.body.errorCode;
  }

  return 'UNKNOWN_ERROR';
}

export function translateApiErrorCode(errorCode: string): string {
  const key = `apiErrors.${errorCode}`;
  const translated = t(key as never);

  if (translated !== key) {
    return translated;
  }

  return t('apiErrors.UNKNOWN_ERROR');
}

export function mapApiError(error: unknown): IError {
  if (error instanceof ApiError) {
    const code = readErrorCode(error);

    if (error.fieldErrors?.length) {
      const details = error.fieldErrors
        .map(fieldError =>
          fieldError.field
            ? `${fieldError.field}: ${fieldError.errorMessage}`
            : fieldError.errorMessage,
        )
        .join('\n');

      return {
        code,
        message: details || translateApiErrorCode(code),
      };
    }

    return {
      code,
      message: translateApiErrorCode(code),
    };
  }

  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || t('apiErrors.UNKNOWN_ERROR'),
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: t('apiErrors.UNKNOWN_ERROR'),
  };
}
