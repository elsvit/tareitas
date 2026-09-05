import { z } from 'zod';

export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;

export function sanitizeUsernameInput(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, '');
}

export function usernameSchema(options: {
  requiredMessage: string;
  invalidMessage: string;
}) {
  return z
    .string()
    .trim()
    .min(1, options.requiredMessage)
    .regex(USERNAME_PATTERN, options.invalidMessage);
}
