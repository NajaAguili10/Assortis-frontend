import { useEffect, useMemo, useState } from 'react';
import {
  expertContractorCollaborationsMock,
  expertContractorOrganizationsMock,
} from '@app/modules/expert/data/expert-projects-scoring.data';
import {
  ContractorCollaborationDTO,
  ContractorOrganizationDTO,
  ContractorScoreInputDTO,
  ContractorSummaryDTO,
} from '@app/modules/expert/types/expert-projects-scoring.dto';

const RECENTLY_SCORED_DAYS = 14;
const ORGANIZATIONS_STORAGE_KEY = 'expert-projects-contractors-organizations';
const COLLABORATIONS_STORAGE_KEY = 'expert-projects-contractors-collaborations';

const clampScore = (value: number) => Math.min(10, Math.max(1, value));

const calculateOverallScore = (score?: ContractorScoreInputDTO): number | null => {
  if (!score) return null;

  const values = Object.values(score);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(average.toFixed(1));
};

const isRecentlyScored = (updatedAt: string | undefined): boolean => {
  if (!updatedAt) return false;
  const lastUpdate = new Date(updatedAt).getTime();
  const now = Date.now();
  return now - lastUpdate <= RECENTLY_SCORED_DAYS * 24 * 60 * 60 * 1000;
};

export interface CollaborationScoringRowDTO extends ContractorCollaborationDTO {
  organizationName: string;
  organizationDescription?: string;
  overallScore: number | null;
  missingEvaluation: boolean;
  recentlyScored: boolean;
}

export const useExpertProjectsScoring = () => {
  const [organizations, setOrganizations] = useState<ContractorOrganizationDTO[]>(() => {
    if (typeof window === 'undefined') return expertContractorOrganizationsMock;

    const cachedValue = window.localStorage.getItem(ORGANIZATIONS_STORAGE_KEY);
    if (!cachedValue) return expertContractorOrganizationsMock;

    try {
      return JSON.parse(cachedValue) as ContractorOrganizationDTO[];
    } catch {
      return expertContractorOrganizationsMock;
    }
  });

  const [collaborations, setCollaborations] = useState<ContractorCollaborationDTO[]>(() => {
    if (typeof window === 'undefined') return expertContractorCollaborationsMock;

    const cachedValue = window.localStorage.getItem(COLLABORATIONS_STORAGE_KEY);
    if (!cachedValue) return expertContractorCollaborationsMock;

    try {
      return JSON.parse(cachedValue) as ContractorCollaborationDTO[];
    } catch {
      return expertContractorCollaborationsMock;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ORGANIZATIONS_STORAGE_KEY, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(COLLABORATIONS_STORAGE_KEY, JSON.stringify(collaborations));
  }, [collaborations]);

  const contractorSummaries = useMemo<ContractorSummaryDTO[]>(() => {
    return organizations.map((organization) => {
      const orgCollaborations = collaborations.filter(
        (collaboration) => collaboration.contractorId === organization.id,
      );
      const scoredCollaborations = orgCollaborations.filter((collaboration) => collaboration.score);
      const overallScores = scoredCollaborations
        .map((collaboration) => calculateOverallScore(collaboration.score))
        .filter((score): score is number => score !== null);

      const averageScore = overallScores.length
        ? Number((overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length).toFixed(1))
        : null;

      const lastScoredAt = scoredCollaborations
        .map((collaboration) => collaboration.updatedAt)
        .filter((date): date is string => Boolean(date))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;

      return {
        contractorId: organization.id,
        name: organization.name,
        description: organization.description,
        bookmarked: organization.bookmarked,
        collaborationCount: orgCollaborations.length,
        overallScore: averageScore,
        missingEvaluationsCount: orgCollaborations.filter((collaboration) => !collaboration.score).length,
        lastScoredAt,
        isRecentlyScored: isRecentlyScored(lastScoredAt ?? undefined),
      };
    });
  }, [collaborations, organizations]);

  const scoringRows = useMemo<CollaborationScoringRowDTO[]>(() => {
    return collaborations
      .map((collaboration) => {
        const organization = organizations.find((entry) => entry.id === collaboration.contractorId);
        return {
          ...collaboration,
          organizationName: organization?.name ?? 'Unknown organization',
          organizationDescription: organization?.description,
          overallScore: calculateOverallScore(collaboration.score),
          missingEvaluation: !collaboration.score,
          recentlyScored: isRecentlyScored(collaboration.updatedAt),
        };
      })
      .sort((a, b) => {
        if (a.missingEvaluation && !b.missingEvaluation) return -1;
        if (!a.missingEvaluation && b.missingEvaluation) return 1;
        return a.organizationName.localeCompare(b.organizationName);
      });
  }, [collaborations, organizations]);

  const overallOrganizationsAverage = useMemo(() => {
    const scored = contractorSummaries
      .map((summary) => summary.overallScore)
      .filter((score): score is number => score !== null);

    if (!scored.length) return null;
    return Number((scored.reduce((sum, score) => sum + score, 0) / scored.length).toFixed(1));
  }, [contractorSummaries]);

  const toggleBookmark = (contractorId: string) => {
    setOrganizations((previous) =>
      previous.map((organization) =>
        organization.id === contractorId
          ? { ...organization, bookmarked: !organization.bookmarked }
          : organization,
      ),
    );
  };

  const saveCollaborationScore = (collaborationId: string, score: ContractorScoreInputDTO) => {
    const safeScore: ContractorScoreInputDTO = {
      financialPackageFairness: clampScore(score.financialPackageFairness),
      contractualTermsRespect: clampScore(score.contractualTermsRespect),
      communicationQuality: clampScore(score.communicationQuality),
      technicalBackstopping: clampScore(score.technicalBackstopping),
      financialBackstopping: clampScore(score.financialBackstopping),
      adminLogisticsBackstopping: clampScore(score.adminLogisticsBackstopping),
    };

    setCollaborations((previous) =>
      previous.map((collaboration) =>
        collaboration.id === collaborationId
          ? {
              ...collaboration,
              score: safeScore,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : collaboration,
      ),
    );
  };

  const getContractorById = (contractorId: string) =>
    organizations.find((organization) => organization.id === contractorId);

  const getCollaborationsByContractor = (contractorId: string) =>
    collaborations.filter((collaboration) => collaboration.contractorId === contractorId);

  const bookmarkedContractors = contractorSummaries.filter((summary) => summary.bookmarked);
  const discoverableContractors = contractorSummaries.filter((summary) => !summary.bookmarked);

  const scoredOrganizationsCount = contractorSummaries.filter(
    (summary) => summary.overallScore !== null,
  ).length;

  const pendingEvaluationsCount = scoringRows.filter((row) => row.missingEvaluation).length;
  const recentlyScoredCount = contractorSummaries.filter((summary) => summary.isRecentlyScored).length;

  return {
    contractorSummaries,
    bookmarkedContractors,
    discoverableContractors,
    scoringRows,
    overallOrganizationsAverage,
    scoredOrganizationsCount,
    pendingEvaluationsCount,
    recentlyScoredCount,
    toggleBookmark,
    saveCollaborationScore,
    getContractorById,
    getCollaborationsByContractor,
  };
};
