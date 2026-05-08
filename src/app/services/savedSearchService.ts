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

export type SavedSearchAlertFrequency = 'daily' | 'weekly' | 'unsubscribe';
export type SavedSearchEmailFormat = 'summary' | 'detailed';
export type SavedSearchStatus = 'active' | 'paused';

export interface SavedSearchAlertSettings {
  alertFrequency: SavedSearchAlertFrequency;
  alertDays: string[];
  alertHour: string;
  emailFormat: SavedSearchEmailFormat;
  status: SavedSearchStatus;
}

export interface SavedSearch<TFilters = unknown> {
  id: string;
  user_id: string;
  name: string;
  filters: TFilters;
  context: SavedSearchContext;
  alertsEnabled?: boolean;
  alertFrequency?: SavedSearchAlertFrequency;
  alertDays?: string[];
  alertHour?: string;
  emailFormat?: SavedSearchEmailFormat;
  status?: SavedSearchStatus;
  lastExecutionAt?: string;
  lastMatchCount?: number;
  created_at: string;
  updated_at?: string;
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

export const normalizeSavedSearch = <TFilters = unknown>(item: SavedSearch<TFilters>): SavedSearch<TFilters> => {
  const alertFrequency = item.alertFrequency || (item.alertsEnabled === false ? 'unsubscribe' : 'daily');
  return {
    ...item,
    alertFrequency,
    alertDays: Array.isArray(item.alertDays) ? item.alertDays : [],
    alertHour: item.alertHour || '08:00',
    emailFormat: item.emailFormat || 'summary',
    status: item.status || (alertFrequency === 'unsubscribe' ? 'paused' : 'active'),
    alertsEnabled: item.alertsEnabled ?? alertFrequency !== 'unsubscribe',
    updated_at: item.updated_at || item.created_at,
  };
};

export const resolveSavedSearchUserId = (userId?: string | number | null) =>
  userId === undefined || userId === null || userId === '' ? ANONYMOUS_USER_ID : String(userId);

export const savedSearchService = {
  list(userId?: string | number | null, type?: SavedSearchType): SavedSearch[] {
    const resolvedUserId = resolveSavedSearchUserId(userId);
    return readAll()
      .filter((item) => item.user_id === resolvedUserId && (!type || item.context.type === type))
      .map((item) => normalizeSavedSearch(item))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  get(id: string): SavedSearch | null {
    const item = readAll().find((item) => item.id === id);
    return item ? normalizeSavedSearch(item) : null;
  },

  save<TFilters>(input: {
    userId?: string | number | null;
    name: string;
    filters: TFilters;
    context: SavedSearchContext;
    alertsEnabled?: boolean;
  } & Partial<SavedSearchAlertSettings>): SavedSearch<TFilters> {
    const now = new Date().toISOString();
    const alertFrequency = input.alertFrequency || (input.alertsEnabled === false ? 'unsubscribe' : 'daily');
    const entry: SavedSearch<TFilters> = {
      id: `saved-search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      user_id: resolveSavedSearchUserId(input.userId),
      name: input.name.trim(),
      filters: input.filters,
      context: input.context,
      alertsEnabled: input.alertsEnabled ?? alertFrequency !== 'unsubscribe',
      alertFrequency,
      alertDays: input.alertDays || [],
      alertHour: input.alertHour || '08:00',
      emailFormat: input.emailFormat || 'summary',
      status: input.status || (alertFrequency === 'unsubscribe' ? 'paused' : 'active'),
      created_at: now,
      updated_at: now,
    };
    writeAll([entry as SavedSearch, ...readAll()]);
    return entry;
  },

  update<TFilters>(id: string, patch: Partial<SavedSearch<TFilters>>) {
    const now = new Date().toISOString();
    const next = readAll().map((item) => (
      item.id === id
        ? {
            ...normalizeSavedSearch(item),
            ...patch,
            name: patch.name === undefined ? item.name : patch.name.trim(),
            updated_at: now,
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
    const enabled = !(current.status === 'active' && current.alertFrequency !== 'unsubscribe');
    this.update(id, {
      alertsEnabled: enabled,
      status: enabled ? 'active' : 'paused',
      alertFrequency: enabled && current.alertFrequency === 'unsubscribe' ? 'daily' : current.alertFrequency,
    });
  },

  duplicate(id: string): SavedSearch | null {
    const current = this.get(id);
    if (!current) return null;
    return this.save({
      userId: current.user_id,
      name: `${current.name} copy`,
      filters: current.filters,
      context: current.context,
      alertsEnabled: current.alertsEnabled,
      alertFrequency: current.alertFrequency,
      alertDays: current.alertDays,
      alertHour: current.alertHour,
      emailFormat: current.emailFormat,
      status: current.status,
    });
  },

  setPaused(id: string, paused: boolean) {
    const current = this.get(id);
    if (!current) return;
    this.update(id, {
      status: paused ? 'paused' : 'active',
      alertsEnabled: !paused && current.alertFrequency !== 'unsubscribe',
    });
  },

  recordRun(id: string, matchCount?: number) {
    this.update(id, {
      lastExecutionAt: new Date().toISOString(),
      lastMatchCount: matchCount ?? Math.floor(12 + Math.random() * 86),
    });
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
