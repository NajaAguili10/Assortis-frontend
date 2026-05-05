export type SavedSearchType =
  | 'map'
  | 'projects'
  | 'awards'
  | 'shortlists'
  | 'organisations'
  | 'experts'
  | 'bid-writers';

export interface SavedSearchContext {
  type: SavedSearchType;
  route: string;
  label: string;
  summary?: string[];
  language?: string;
  accountType?: string;
}

export interface SavedSearch<TFilters = unknown> {
  id: string;
  user_id: string;
  name: string;
  filters: TFilters;
  context: SavedSearchContext;
  alertsEnabled?: boolean;
  created_at: string;
}

const STORAGE_KEY = 'assortis.savedSearches.v1';
const ANONYMOUS_USER_ID = 'public';

const readAll = (): SavedSearch[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.name && item?.context) : [];
  } catch {
    return [];
  }
};

const writeAll = (items: SavedSearch[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const resolveSavedSearchUserId = (userId?: string | number | null) =>
  userId === undefined || userId === null || userId === '' ? ANONYMOUS_USER_ID : String(userId);

export const savedSearchService = {
  list(userId?: string | number | null, type?: SavedSearchType): SavedSearch[] {
    const resolvedUserId = resolveSavedSearchUserId(userId);
    return readAll()
      .filter((item) => item.user_id === resolvedUserId && (!type || item.context.type === type))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  get(id: string): SavedSearch | null {
    return readAll().find((item) => item.id === id) || null;
  },

  save<TFilters>(input: {
    userId?: string | number | null;
    name: string;
    filters: TFilters;
    context: SavedSearchContext;
    alertsEnabled?: boolean;
  }): SavedSearch<TFilters> {
    const now = new Date().toISOString();
    const entry: SavedSearch<TFilters> = {
      id: `saved-search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: resolveSavedSearchUserId(input.userId),
      name: input.name.trim(),
      filters: input.filters,
      context: input.context,
      alertsEnabled: input.alertsEnabled ?? false,
      created_at: now,
    };
    writeAll([entry as SavedSearch, ...readAll()]);
    return entry;
  },

  update<TFilters>(id: string, patch: Partial<Pick<SavedSearch<TFilters>, 'name' | 'filters' | 'context' | 'alertsEnabled'>>) {
    const next = readAll().map((item) => (
      item.id === id
        ? {
            ...item,
            ...patch,
            name: patch.name === undefined ? item.name : patch.name.trim(),
          }
        : item
    ));
    writeAll(next);
  },

  remove(id: string) {
    writeAll(readAll().filter((item) => item.id !== id));
  },

  toggleAlerts(id: string) {
    const current = this.get(id);
    if (!current) return;
    this.update(id, { alertsEnabled: !current.alertsEnabled });
  },
};

export const getSavedSearchTypeRoute = (type: SavedSearchType) => {
  if (type === 'map') return '/search/map';
  if (type === 'projects') return '/search/projects';
  if (type === 'awards') return '/search/awards';
  if (type === 'shortlists') return '/search/shortlists';
  if (type === 'organisations') return '/search/organisations';
  if (type === 'experts') return '/search/experts';
  return '/search/bid-writers';
};
