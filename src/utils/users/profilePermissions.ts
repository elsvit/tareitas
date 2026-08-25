export function canEditUserProfile(
  isAdmin: boolean,
  currentUserId: string | null | undefined,
  targetUserId: string,
): boolean {
  if (isAdmin) {
    return true;
  }

  if (!currentUserId) {
    return false;
  }

  return currentUserId === targetUserId;
}
