import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  organizationTenderService,
  OrganizationTenderItem,
  TenderQuickCreatePayload,
} from '@app/services/organizationTenderService';

export function useOrganizationTenders() {
  const [tenders, setTenders] = useState<OrganizationTenderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTenders = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await organizationTenderService.getCurrentOrganizationTenders();
      setTenders(
        [...loaded].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTenders();

    const onFocus = () => {
      refreshTenders();
    };

    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshTenders]);

  const stats = useMemo(() => {
    const total = tenders.length;
    const draft = tenders.filter(item => item.status === 'DRAFT').length;

    return { total, draft };
  }, [tenders]);

  const getTenderById = useCallback(
    (id?: string | null) => {
      if (!id) return null;
      return tenders.find(item => item.id === id) ?? null;
    },
    [tenders],
  );

  const updateTender = useCallback(
    async (id: string, payload: TenderQuickCreatePayload) => {
      const updated = await organizationTenderService.updateCurrentOrganizationTender(id, payload);
      await refreshTenders();
      return updated;
    },
    [refreshTenders],
  );

  const deleteTender = useCallback(
    async (id: string) => {
      await organizationTenderService.deleteCurrentOrganizationTender(id);
      await refreshTenders();
      return true;
    },
    [refreshTenders],
  );

  return {
    tenders,
    isLoading,
    refreshTenders,
    getTenderById,
    updateTender,
    deleteTender,
    stats,
  };
}
