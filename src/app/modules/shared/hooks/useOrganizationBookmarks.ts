import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'organizations.bookmarked.ids';
const DEFAULT_BOOKMARKED_ORGANIZATION_ID = '1';
const SEED_KEY = 'organizations.bookmarked.seed.v1';

function seedDefaultBookmark(existingIds: string[]): string[] {
  if (typeof window === 'undefined') return existingIds;

  const seeded = Array.from(new Set([...existingIds, DEFAULT_BOOKMARKED_ORGANIZATION_ID]));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  window.localStorage.setItem(SEED_KEY, '1');
  return seeded;
}

function readBookmarkedOrganizationIds(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const hasSeededDefault = window.localStorage.getItem(SEED_KEY) === '1';
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return hasSeededDefault ? [] : seedDefaultBookmark([]);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return hasSeededDefault ? [] : seedDefaultBookmark([]);

    const sanitized = parsed.filter((id): id is string => typeof id === 'string');
    return hasSeededDefault ? sanitized : seedDefaultBookmark(sanitized);
  } catch {
    return [DEFAULT_BOOKMARKED_ORGANIZATION_ID];
  }
}

export function useOrganizationBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => new Set(readBookmarkedOrganizationIds()));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  const isBookmarked = (organizationId: string) => bookmarkedIds.has(organizationId);

  const toggleBookmark = (organizationId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(organizationId)) {
        next.delete(organizationId);
      } else {
        next.add(organizationId);
      }
      return next;
    });
  };

  const bookmarkedOrganizationIds = useMemo(() => Array.from(bookmarkedIds), [bookmarkedIds]);

  return {
    bookmarkedOrganizationIds,
    isBookmarked,
    toggleBookmark,
  };
}
