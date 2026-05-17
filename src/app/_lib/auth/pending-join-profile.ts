const KEY = "phronis_pending_join_display_name";

export function stashJoinDisplayName(name: string): void {
  try {
    sessionStorage.setItem(KEY, name.trim().slice(0, 80));
  } catch {
    /* private mode */
  }
}

export function takeJoinDisplayName(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}
