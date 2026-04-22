import { useState, useCallback } from 'react';

export interface MatchedExpert {
  expertId: string;
  expertName: string;
  matchScore: number;
  skills: string[];
  experience: number;
  availability: string;
}

export interface MatchingArchive {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference?: string;
  torTitle?: string;
  matchingDate: string;
  matchedExperts: MatchedExpert[];
  notes?: string;
}

export function useMatchingArchive() {
  const [archives, setArchives] = useState<MatchingArchive[]>(() => {
    const stored = localStorage.getItem('matching_archives');
    return stored ? JSON.parse(stored) : [];
  });

  const saveMatching = useCallback((
    tenderId: string,
    tenderTitle: string,
    torTitle: string,
    matchedExperts: MatchedExpert[],
    tenderReference?: string,
    notes?: string
  ) => {
    const newArchive: MatchingArchive = {
      id: `matching-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenderId,
      tenderTitle,
      tenderReference,
      torTitle,
      matchingDate: new Date().toISOString(),
      matchedExperts,
      notes,
    };

    setArchives((prev) => {
      const updated = [newArchive, ...prev];
      localStorage.setItem('matching_archives', JSON.stringify(updated));
      return updated;
    });

    return newArchive.id;
  }, []);

  const deleteMatching = useCallback((matchingId: string) => {
    setArchives((prev) => {
      const updated = prev.filter((archive) => archive.id !== matchingId);
      localStorage.setItem('matching_archives', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateMatchingNotes = useCallback((matchingId: string, notes: string) => {
    setArchives((prev) => {
      const updated = prev.map((archive) =>
        archive.id === matchingId ? { ...archive, notes } : archive
      );
      localStorage.setItem('matching_archives', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getMatchingById = useCallback(
    (matchingId: string) => {
      return archives.find((archive) => archive.id === matchingId);
    },
    [archives]
  );

  const getMatchingsByTender = useCallback(
    (tenderId: string) => {
      return archives.filter((archive) => archive.tenderId === tenderId);
    },
    [archives]
  );

  const clearArchives = useCallback(() => {
    setArchives([]);
    localStorage.removeItem('matching_archives');
  }, []);

  return {
    archives,
    saveMatching,
    deleteMatching,
    updateMatchingNotes,
    getMatchingById,
    getMatchingsByTender,
    clearArchives,
  };
}
