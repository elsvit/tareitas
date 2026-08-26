import { IChild } from '~/types/IChild';

export function dedupeChildren(children: IChild[]): IChild[] {
  const uniqueChildren = new Map<string, IChild>();

  for (const child of children) {
    const key = child.name.trim().toLowerCase();
    const current = uniqueChildren.get(key);

    if (!current) {
      uniqueChildren.set(key, child);
      continue;
    }

    const preferChild =
      Boolean(child.username?.trim()) && !current.username?.trim();

    if (preferChild) {
      uniqueChildren.set(key, child);
    }
  }

  return [...uniqueChildren.values()];
}

export function isAllChildrenRewardAssignment(
  childIds: string[] | undefined,
  validChildIds: string[],
): boolean {
  if (!validChildIds.length) {
    return true;
  }

  if (!childIds?.length) {
    return true;
  }

  if (childIds.length !== validChildIds.length) {
    return false;
  }

  const selected = new Set(childIds);

  return validChildIds.every(id => selected.has(id));
}

export function normalizeRewardChildIdsForSave(
  childIds: string[] | undefined,
  validChildIds: string[],
): string[] | undefined {
  if (isAllChildrenRewardAssignment(childIds, validChildIds)) {
    return undefined;
  }

  const filtered = filterValidChildIds(childIds, validChildIds);

  return filtered?.length ? filtered : undefined;
}

export function rewardChildIdsForForm(
  childIds: string[] | undefined,
  validChildIds: string[],
): string[] {
  if (!validChildIds.length) {
    return [];
  }

  if (isAllChildrenRewardAssignment(childIds, validChildIds)) {
    return validChildIds;
  }

  if (!childIds?.length) {
    return validChildIds;
  }

  const filtered = filterValidChildIds(childIds, validChildIds);

  return filtered?.length ? filtered : validChildIds;
}

export function filterValidChildIds(
  childIds: string[] | undefined,
  validChildIds: string[],
): string[] | undefined {
  if (!childIds?.length) {
    return undefined;
  }

  const validSet = new Set(validChildIds);
  const filtered = childIds.filter(id => validSet.has(id));

  return filtered.length ? filtered : undefined;
}

/** Server empty array = all children. Non-empty = explicit subset. */
export function mapServerChildUserIdsToChildIds(
  serverChildUserIds: string[] | undefined,
  validChildIds: string[],
): string[] | undefined {
  if (!serverChildUserIds?.length) {
    return undefined;
  }

  return filterValidChildIds(serverChildUserIds, validChildIds);
}

export function resolveSavedRewardChildIds(
  savedChildIds: string[] | undefined,
  serverChildUserIds: string[] | undefined,
  validChildIds: string[],
): string[] | undefined {
  const fromSaved = filterValidChildIds(savedChildIds, validChildIds);

  if (fromSaved?.length) {
    return fromSaved;
  }

  return mapServerChildUserIdsToChildIds(serverChildUserIds, validChildIds);
}

export function isRewardAssignedToChild(
  assignment: { childIds?: string[] } | undefined,
  childId: string,
  validChildIds: string[] = [],
) {
  if (!assignment || !childId) {
    return false;
  }

  if (!assignment.childIds?.length) {
    return true;
  }

  if (assignment.childIds.includes(childId)) {
    return true;
  }

  if (
    validChildIds.length > 0 &&
    isAllChildrenRewardAssignment(assignment.childIds, validChildIds)
  ) {
    return true;
  }

  return false;
}

export function remapChildIds(
  childIds: string[] | undefined,
  fromId: string,
  toId: string,
): string[] | undefined {
  if (!childIds?.length) {
    return undefined;
  }

  if (!childIds.includes(fromId)) {
    return childIds;
  }

  const next = childIds.map(id => (id === fromId ? toId : id));

  return [...new Set(next)];
}
