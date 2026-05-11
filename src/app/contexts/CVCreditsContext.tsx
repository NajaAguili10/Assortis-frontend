import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CreditUsageEntry {
  id: string;
  expertId: string;
  expertName: string;
  creditsSpent: number;
  date: string;
}

export interface ExpertVacancyLink {
  vacancyId: string;
  vacancyTitle: string;
  projectTitle?: string;
  linkedAt: string;
}

export interface ExpertDownloadEntry {
  id: string;
  format: string;
  fileName: string;
  downloadedAt: string;
}

export interface ExpertReferenceEntry {
  id: string;
  donorFormat: string;
  fileName: string;
  generatedAt: string;
}

export interface ExpertLibraryRecord {
  expertId: string;
  expertName: string;
  unlockedAt: string;
  downloads: ExpertDownloadEntry[];
  references: ExpertReferenceEntry[];
  linkedVacancies: ExpertVacancyLink[];
}

interface UnlockResult {
  success: boolean;
  error?: 'INSUFFICIENT_CREDITS';
}

interface CVCreditsContextType {
  availableCredits: number;
  creditsUsed: number;
  libraryExpertIds: string[];
  expertLibrary: ExpertLibraryRecord[];
  usageHistory: CreditUsageEntry[];
  unlockExpertCV: (expertId: string, expertName: string, creditCost?: number) => UnlockResult;
  recordExpertDownload: (expertId: string, format: string, fileName: string) => void;
  recordExpertReference: (expertId: string, donorFormat: string, fileName: string) => void;
  linkExpertToVacancy: (expertId: string, vacancy: Omit<ExpertVacancyLink, 'linkedAt'>) => void;
  spendCredits: (creditCost?: number) => boolean;
  buyCredits: (creditAmount: number) => void;
  canUnlock: (creditCost?: number) => boolean;
}

const INITIAL_CV_CREDITS = 12;
const STORAGE_KEY = 'assortis.cvCredits.library';

interface StoredCreditsState {
  availableCredits: number;
  creditsUsed: number;
  expertLibrary: ExpertLibraryRecord[];
  usageHistory: CreditUsageEntry[];
}

const readStoredState = (): StoredCreditsState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStoredState = (state: StoredCreditsState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors.
  }
};

const CVCreditsContext = createContext<CVCreditsContextType | undefined>(undefined);

export const CVCreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedState = readStoredState();
  const [availableCredits, setAvailableCredits] = useState<number>(storedState?.availableCredits ?? INITIAL_CV_CREDITS);
  const [creditsUsed, setCreditsUsed] = useState<number>(storedState?.creditsUsed ?? 0);
  const [expertLibrary, setExpertLibrary] = useState<ExpertLibraryRecord[]>(storedState?.expertLibrary ?? []);
  const [usageHistory, setUsageHistory] = useState<CreditUsageEntry[]>(storedState?.usageHistory ?? []);

  const libraryExpertIds = useMemo(() => expertLibrary.map((record) => record.expertId), [expertLibrary]);

  React.useEffect(() => {
    writeStoredState({ availableCredits, creditsUsed, expertLibrary, usageHistory });
  }, [availableCredits, creditsUsed, expertLibrary, usageHistory]);

  const canUnlock = (creditCost = 1): boolean => availableCredits >= creditCost;

  const unlockExpertCV = (expertId: string, expertName: string, creditCost = 1): UnlockResult => {
    const alreadyUnlocked = libraryExpertIds.includes(expertId);
    if (alreadyUnlocked) {
      return { success: true };
    }

    if (!canUnlock(creditCost)) {
      return { success: false, error: 'INSUFFICIENT_CREDITS' };
    }

    const nowIso = new Date().toISOString();

    setAvailableCredits((current) => current - creditCost);
    setCreditsUsed((current) => current + creditCost);
    setExpertLibrary((current) => [
      {
        expertId,
        expertName,
        unlockedAt: nowIso,
        downloads: [],
        references: [],
        linkedVacancies: [],
      },
      ...current,
    ]);
    setUsageHistory((current) => [
      {
        id: `${expertId}-${nowIso}`,
        expertId,
        expertName,
        creditsSpent: creditCost,
        date: nowIso,
      },
      ...current,
    ]);

    return { success: true };
  };

  const ensureRecord = (expertId: string, expertName = `Expert #${expertId}`) => {
    setExpertLibrary((current) => {
      if (current.some((record) => record.expertId === expertId)) return current;
      return [
        {
          expertId,
          expertName,
          unlockedAt: new Date().toISOString(),
          downloads: [],
          references: [],
          linkedVacancies: [],
        },
        ...current,
      ];
    });
  };

  const recordExpertDownload = (expertId: string, format: string, fileName: string) => {
    const nowIso = new Date().toISOString();
    ensureRecord(expertId);
    setExpertLibrary((current) => current.map((record) => (
      record.expertId === expertId
        ? {
            ...record,
            downloads: [{ id: `${expertId}-download-${nowIso}`, format, fileName, downloadedAt: nowIso }, ...record.downloads],
          }
        : record
    )));
  };

  const recordExpertReference = (expertId: string, donorFormat: string, fileName: string) => {
    const nowIso = new Date().toISOString();
    ensureRecord(expertId);
    setExpertLibrary((current) => current.map((record) => (
      record.expertId === expertId
        ? {
            ...record,
            references: [{ id: `${expertId}-reference-${nowIso}`, donorFormat, fileName, generatedAt: nowIso }, ...record.references],
          }
        : record
    )));
  };

  const linkExpertToVacancy = (expertId: string, vacancy: Omit<ExpertVacancyLink, 'linkedAt'>) => {
    const nowIso = new Date().toISOString();
    ensureRecord(expertId);
    setExpertLibrary((current) => current.map((record) => {
      if (record.expertId !== expertId) return record;
      const exists = record.linkedVacancies.some((link) => link.vacancyId === vacancy.vacancyId);
      return {
        ...record,
        linkedVacancies: exists
          ? record.linkedVacancies
          : [{ ...vacancy, linkedAt: nowIso }, ...record.linkedVacancies],
      };
    }));
  };

  const spendCredits = (creditCost = 1): boolean => {
    if (!canUnlock(creditCost)) return false;

    setAvailableCredits((current) => current - creditCost);
    setCreditsUsed((current) => current + creditCost);

    return true;
  };

  const buyCredits = (creditAmount: number): void => {
    if (creditAmount <= 0) return;
    setAvailableCredits((current) => current + creditAmount);
  };

  const value = useMemo<CVCreditsContextType>(
    () => ({
      availableCredits,
      creditsUsed,
      libraryExpertIds,
      expertLibrary,
      usageHistory,
      unlockExpertCV,
      recordExpertDownload,
      recordExpertReference,
      linkExpertToVacancy,
      spendCredits,
      buyCredits,
      canUnlock,
    }),
    [availableCredits, creditsUsed, libraryExpertIds, expertLibrary, usageHistory]
  );

  return <CVCreditsContext.Provider value={value}>{children}</CVCreditsContext.Provider>;
};

export const useCVCredits = (): CVCreditsContextType => {
  const context = useContext(CVCreditsContext);
  if (!context) {
    throw new Error('useCVCredits must be used within a CVCreditsProvider');
  }

  return context;
};
