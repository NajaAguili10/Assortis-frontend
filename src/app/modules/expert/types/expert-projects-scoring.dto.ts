export enum ContractorScoringCategoryEnum {
  FINANCIAL_PACKAGE_FAIRNESS = 'FINANCIAL_PACKAGE_FAIRNESS',
  CONTRACTUAL_TERMS_RESPECT = 'CONTRACTUAL_TERMS_RESPECT',
  COMMUNICATION_QUALITY = 'COMMUNICATION_QUALITY',
  TECHNICAL_BACKSTOPPING = 'TECHNICAL_BACKSTOPPING',
  FINANCIAL_BACKSTOPPING = 'FINANCIAL_BACKSTOPPING',
  ADMIN_LOGISTICS_BACKSTOPPING = 'ADMIN_LOGISTICS_BACKSTOPPING',
}

export interface ContractorScoreInputDTO {
  financialPackageFairness: number;
  contractualTermsRespect: number;
  communicationQuality: number;
  technicalBackstopping: number;
  financialBackstopping: number;
  adminLogisticsBackstopping: number;
}

export interface ContractorOrganizationDTO {
  id: string;
  name: string;
  description?: string;
  bookmarked: boolean;
}

export interface ContractorCollaborationDTO {
  id: string;
  contractorId: string;
  projectName: string;
  startDate: string;
  endDate: string;
  score?: ContractorScoreInputDTO;
  updatedAt?: string;
}

export interface ContractorSummaryDTO {
  contractorId: string;
  name: string;
  description?: string;
  bookmarked: boolean;
  collaborationCount: number;
  overallScore: number | null;
  missingEvaluationsCount: number;
  lastScoredAt: string | null;
  isRecentlyScored: boolean;
}
