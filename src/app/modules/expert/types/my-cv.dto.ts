export type CVFormatType =
  | 'assortis'
  | 'adb'
  | 'afdb'
  | 'ec'
  | 'europass'
  | 'world-bank';

export type CVLanguageType = 'en' | 'fr' | 'es';

export type CVValidationStatusType = 'validated' | 'pending_validation' | 'rejected';

export type ProjectDurationPreferenceType =
  | 'short_term'
  | 'long_term'
  | 'in_house';

export interface ExpertMyCVKpiDTO {
  views: number;
  downloads: number;
  relevanceScore: number;
}

export interface ExpertMyCVActivityDTO {
  id: string;
  type: 'view' | 'download';
  organizationName: string;
  happenedAt: string;
}

export interface ExpertMyCVStatusDTO {
  lastUpdatedAt: string;
  validationStatus: CVValidationStatusType;
}

export interface ExpertMyCVPreferencesDTO {
  isVisible: boolean;
  matchingEnabled: boolean;
  notifyOnDownload: boolean;
  broadcastEnabled: boolean;
}

export interface ExpertMyCVMetadataDTO {
  expertId: string;
  lastUpdatedAt: string;
  validationStatus: CVValidationStatusType;
}

export interface ExpertMyCVDocumentDTO {
  id: string;
  name: string;
  category: 'private' | 'tor' | 'report' | 'cv';
  uploadedAt: string;
  sizeLabel: string;
}

export interface ExpertMyCVExperienceLinkDTO {
  id: string;
  experienceTitle: string;
  projectTitle: string;
  confidenceScore: number;
}

export interface ExpertMyCVSectionDTO {
  id:
    | 'personal-information'
    | 'education'
    | 'training'
    | 'professional-experience'
    | 'employment-record-projects'
    | 'language-skills'
    | 'other'
    | 'permanent-address'
    | 'current-address';
  content: string[];
}

export interface ExpertMyCVInfoDTO {
  metadata: ExpertMyCVMetadataDTO;
  controls: {
    format: CVFormatType;
    language: CVLanguageType;
  };
  sections: ExpertMyCVSectionDTO[];
  documents: ExpertMyCVDocumentDTO[];
  experienceLinks: ExpertMyCVExperienceLinkDTO[];
}

export interface ExpertMyCVDashboardDTO {
  kpis: ExpertMyCVKpiDTO;
  recentActivity: ExpertMyCVActivityDTO[];
  status: ExpertMyCVStatusDTO;
  organizationsWhoViewed: string[];
  preferences: ExpertMyCVPreferencesDTO;
}

export interface ExpertMyCVUpdatePayloadDTO {
  primaryEmail: string;
  primaryPhone: string;
  availabilityMonth: string;
  availabilityYear: string;
  preferredProjectDurations: ProjectDurationPreferenceType[];
  inHousePositions: 'yes' | 'no';
  dailyRate: number;
  currency: string;
  cvFileName?: string;
  torFileNames: string[];
  reportFileNames: string[];
}

export interface ExpertMyCVFormDTO {
  primaryEmail: string;
  primaryPhone: string;
  availabilityMonth: string;
  availabilityYear: string;
  preferredProjectDurations: ProjectDurationPreferenceType[];
  inHousePositions: 'yes' | 'no';
  dailyRate: string;
  currency: string;
  cvFileName?: string;
  torFileNames: string[];
  reportFileNames: string[];
}
