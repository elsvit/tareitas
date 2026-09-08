import type { EntityState } from '@reduxjs/toolkit';

function isCharIndexedObject(
  value: unknown,
): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length > 0 && keys.every((key, index) => key === String(index));
}

function parseMaybeJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function reviveCharIndexedJson<T>(value: unknown): T | undefined {
  if (!isCharIndexedObject(value)) {
    return undefined;
  }

  const json = Object.keys(value)
    .sort((left, right) => Number(left) - Number(right))
    .map(key => value[key])
    .join('');

  return parseMaybeJson<T>(json);
}

function coerceParsedValue<T>(value: unknown): T | undefined {
  if (typeof value === 'string') {
    return (
      parseMaybeJson<T>(value) ?? reviveCharIndexedJson<T>(value)
    );
  }

  return reviveCharIndexedJson<T>(value);
}

export function isValidEntityState<T>(
  state: EntityState<T, string>,
): boolean {
  return (
    Array.isArray(state.ids) &&
    !!state.entities &&
    typeof state.entities === 'object' &&
    !Array.isArray(state.entities)
  );
}

export function ensureEntityState<T>(
  state: EntityState<T, string>,
): EntityState<T, string> {
  if (isValidEntityState(state)) {
    return state;
  }

  return normalizeEntityState(state);
}

export function normalizeEntityState<T>(
  state: EntityState<T, string>,
): EntityState<T, string> {
  if (isValidEntityState(state)) {
    return state;
  }

  let ids = coerceParsedValue<string[]>(state.ids);
  let entities = coerceParsedValue<Record<string, T>>(state.entities);

  if (!Array.isArray(ids)) {
    ids =
      entities && typeof entities === 'object'
        ? Object.keys(entities)
        : [];
  }

  if (!entities || typeof entities !== 'object' || Array.isArray(entities)) {
    entities = {};
  }

  state.ids = ids;
  state.entities = entities;

  return state;
}

export function entityStateToEntities<T extends { id: string }>(
  state: EntityState<T, string>,
): T[] {
  const normalized = ensureEntityState({ ...state });

  return normalized.ids
    .map(id => normalized.entities[id])
    .filter((entity): entity is T => !!entity);
}
