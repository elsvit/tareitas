import { API_CONFIG } from './config';
import { getApiLang } from './lang';

type ApiFieldError = {
  field?: string;
  errorCode: string;
  errorMessage: string;
};

function formatApiErrorMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null) {
    return 'Request failed';
  }

  const baseMessage =
    'errorMessage' in body &&
    typeof body.errorMessage === 'string'
      ? body.errorMessage
      : 'message' in body &&
          typeof body.message === 'string'
        ? body.message
        : 'Request failed';

  if (
    !('errors' in body) ||
    !Array.isArray(body.errors) ||
    !body.errors.length
  ) {
    return baseMessage;
  }

  const details = body.errors
    .map(item => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      const field =
        'field' in item && typeof item.field === 'string'
          ? item.field
          : undefined;
      const errorMessage =
        'errorMessage' in item &&
        typeof item.errorMessage === 'string'
          ? item.errorMessage
          : 'message' in item &&
              typeof item.message === 'string'
            ? item.message
            : null;

      if (!errorMessage) {
        return null;
      }

      return field
        ? `${field}: ${errorMessage}`
        : errorMessage;
    })
    .filter(
      (item): item is string => item !== null,
    );

  if (!details.length) {
    return baseMessage;
  }

  return `${baseMessage}\n${details.join('\n')}`;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
    readonly fieldErrors?: ApiFieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions = {
  method?: string;
  token?: string | null;
  lang?: string | null;
  body?: unknown;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {};
  const lang = options.lang ?? getApiLang();

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (lang) {
    headers.lang = lang;
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  return fetch(`${API_CONFIG.baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
  });
}

export async function parseApiJson<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    const fieldErrors =
      typeof body === 'object' &&
      body !== null &&
      'errors' in body &&
      Array.isArray(body.errors)
        ? body.errors.filter(
            (
              item,
            ): item is ApiFieldError =>
              typeof item === 'object' &&
              item !== null &&
              'errorMessage' in item &&
              typeof item.errorMessage === 'string',
          )
        : undefined;

    throw new ApiError(
      formatApiErrorMessage(body),
      response.status,
      body,
      fieldErrors?.length ? fieldErrors : undefined,
    );
  }

  return response.json() as Promise<T>;
}
