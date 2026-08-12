export const isPinPassword = (passwordPattern?: string) =>
  !!passwordPattern && /^\d{4}$/.test(passwordPattern);

export const verifyPassword = (
  storedPattern: string,
  inputPattern: string,
) => storedPattern === inputPattern;

export const patternToString = (pattern: number[]) => pattern.join('');
