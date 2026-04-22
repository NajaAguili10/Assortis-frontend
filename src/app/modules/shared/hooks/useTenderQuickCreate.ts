import { useState } from 'react';

export interface TenderQuickCreatePayload {
  title: string;
  description: string;
  sector: string;
  subSector: string;
  country: string;
  donorClient: string;
  budget?: number;
  deadline: string;
}

export interface TenderQuickCreateResult {
  id: string;
  createdAt: string;
  status: 'DRAFT';
}

const QUICK_TENDERS_STORAGE_KEY = 'tenders.quickCreated';

function readQuickTenders(): Array<TenderQuickCreatePayload & TenderQuickCreateResult> {
  try {
    const raw = localStorage.getItem(QUICK_TENDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as Array<TenderQuickCreatePayload & TenderQuickCreateResult>;
  } catch {
    return [];
  }
}

function writeQuickTenders(items: Array<TenderQuickCreatePayload & TenderQuickCreateResult>) {
  try {
    localStorage.setItem(QUICK_TENDERS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // No-op to preserve UX if storage is unavailable.
  }
}

export function useTenderQuickCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTender = async (payload: TenderQuickCreatePayload): Promise<TenderQuickCreateResult> => {
    setIsSubmitting(true);

    try {
      const createdTender: TenderQuickCreatePayload & TenderQuickCreateResult = {
        ...payload,
        id: `tnd-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'DRAFT',
      };

      const existing = readQuickTenders();
      writeQuickTenders([createdTender, ...existing]);

      // Keep async contract compatible with a future API call.
      await Promise.resolve();

      return {
        id: createdTender.id,
        createdAt: createdTender.createdAt,
        status: createdTender.status,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTender,
    isSubmitting,
  };
}
