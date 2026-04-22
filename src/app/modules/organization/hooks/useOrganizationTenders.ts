import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  TenderQuickCreatePayload,
  TenderQuickCreateResult,
} from '@app/modules/shared/hooks/useTenderQuickCreate';

const QUICK_TENDERS_STORAGE_KEY = 'tenders.quickCreated';

export type OrganizationTenderItem = TenderQuickCreatePayload & TenderQuickCreateResult;

function readOrganizationTenders(): OrganizationTenderItem[] {
  try {
    const raw = localStorage.getItem(QUICK_TENDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as OrganizationTenderItem[];
  } catch {
    return [];
  }
}

function writeOrganizationTenders(items: OrganizationTenderItem[]) {
  try {
    localStorage.setItem(QUICK_TENDERS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Keep UI responsive when storage is unavailable.
  }
}

export function useOrganizationTenders() {
  const [tenders, setTenders] = useState<OrganizationTenderItem[]>([]);

  const refreshTenders = useCallback(() => {
    const loaded = readOrganizationTenders().sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    setTenders(loaded);
  }, []);

  useEffect(() => {
    refreshTenders();

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== QUICK_TENDERS_STORAGE_KEY) return;
      refreshTenders();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refreshTenders);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refreshTenders);
    };
  }, [refreshTenders]);

  const stats = useMemo(() => {
    const total = tenders.length;
    const draft = tenders.filter(item => item.status === 'DRAFT').length;

    return {
      total,
      draft,
    };
  }, [tenders]);

  const getTenderById = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return tenders.find(item => item.id === id) ?? null;
    },
    [tenders],
  );

  const updateTender = useCallback(
    async (id: string, payload: Omit<OrganizationTenderItem, 'id' | 'createdAt' | 'status'> & Partial<Pick<OrganizationTenderItem, 'status'>>) => {
      const existing = readOrganizationTenders();
      const current = existing.find(item => item.id === id);
      if (!current) return null;

      const updated: OrganizationTenderItem = {
        ...current,
        ...payload,
      };

      writeOrganizationTenders(existing.map(item => (item.id === id ? updated : item)));
      refreshTenders();

      await Promise.resolve();
      return updated;
    },
    [refreshTenders],
  );

  const deleteTender = useCallback(
    async (id: string) => {
      const existing = readOrganizationTenders();
      const next = existing.filter(item => item.id !== id);
      if (next.length === existing.length) return false;

      writeOrganizationTenders(next);
      refreshTenders();

      await Promise.resolve();
      return true;
    },
    [refreshTenders],
  );

  return {
    tenders,
    refreshTenders,
    getTenderById,
    updateTender,
    deleteTender,
    stats,
  };
}
