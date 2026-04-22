import React, { createContext, useContext, useMemo, useState } from 'react';

interface CreditUsageEntry {
  id: string;
  expertId: string;
  expertName: string;
  creditsSpent: number;
  date: string;
}

interface UnlockResult {
  success: boolean;
  error?: 'INSUFFICIENT_CREDITS';
}

interface CVCreditsContextType {
  availableCredits: number;
  creditsUsed: number;
  libraryExpertIds: string[];
  usageHistory: CreditUsageEntry[];
  unlockExpertCV: (expertId: string, expertName: string, creditCost?: number) => UnlockResult;
  spendCredits: (creditCost?: number) => boolean;
  buyCredits: (creditAmount: number) => void;
  canUnlock: (creditCost?: number) => boolean;
}

const INITIAL_CV_CREDITS = 12;

const CVCreditsContext = createContext<CVCreditsContextType | undefined>(undefined);

export const CVCreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableCredits, setAvailableCredits] = useState<number>(INITIAL_CV_CREDITS);
  const [creditsUsed, setCreditsUsed] = useState<number>(0);
  const [libraryExpertIds, setLibraryExpertIds] = useState<string[]>([]);
  const [usageHistory, setUsageHistory] = useState<CreditUsageEntry[]>([]);

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
    setLibraryExpertIds((current) => [...current, expertId]);
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
      usageHistory,
      unlockExpertCV,
      spendCredits,
      buyCredits,
      canUnlock,
    }),
    [availableCredits, creditsUsed, libraryExpertIds, usageHistory]
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
