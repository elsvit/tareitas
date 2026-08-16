type JsonObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const deepMergeTranslations = <T extends JsonObject>(
  base: T,
  override: JsonObject,
): T => {
  const result: JsonObject = { ...base };

  Object.entries(override).forEach(([key, overrideValue]) => {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMergeTranslations(baseValue, overrideValue);
      return;
    }

    result[key] = overrideValue;
  });

  return result as T;
};
