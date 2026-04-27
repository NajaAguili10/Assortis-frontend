// Matching Opportunities Types and DTOs - Expert module
// Covers: Open Projects, Contract Awards, Shortlists, Project Vacancies, In-house Vacancies

import { ProjectStatusEnum, ProjectTypeEnum, ProjectSectorEnum } from './project.dto';
import {
  CountryEnum,
  FundingAgencyEnum,
  NoticeTypeEnum,
  ProcurementTypeEnum,
  RegionEnum,
  SectorEnum,
  SubSectorEnum,
} from './tender.dto';

export enum OpportunityTypeEnum {
  OPEN_PROJECT = 'OPEN_PROJECT',
  CONTRACT_AWARD = 'CONTRACT_AWARD',
  SHORTLIST = 'SHORTLIST',
  PROJECT_VACANCY = 'PROJECT_VACANCY',
  IN_HOUSE_VACANCY = 'IN_HOUSE_VACANCY',
}

export enum OpportunityStatusEnum {
  ACTIVE = 'ACTIVE',
  CLOSING_SOON = 'CLOSING_SOON',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export interface MatchingOpportunityDTO {
  id: string;
  title: string;
  type: OpportunityTypeEnum;
  donor: string;
  country: string;
  sector: ProjectSectorEnum;
  keywords: string[];
  relevanceScore: number; // 0-100
  deadline: Date;
  budget?: number;
  currency?: string;
  description: string;
  status: OpportunityStatusEnum;
  postedDate: Date;
  organization?: string;
  location?: string;
  contractValue?: number;
  position?: string;
  requirements?: string[];
  awardCompanies?: Array<{
    name: string;
    amount?: number;
    date: Date;
  }>;
  shortlistCompanies?: Array<{
    name: string;
    date: Date;
  }>;
  matchedViaProfile?: string;  // Profile name that generated this match
  matchedViaAlert?: string;   // Alert name that generated this match
}

export interface MatchingStatsDTO {
  totalOpportunities: number;
  matchingOpportunities: number;
  averageRelevance: number;
  lastUpdated: Date;
}

export interface PendingMatchDTO {
  id: string;
  organizationName: string;
  mutualInterest: boolean;
  interestPercentage: number;
  lastInteractionDate: Date;
  status: 'pending' | 'interested' | 'connected';
}

export interface MatchingOpportunitiesFilterDTO {
  search: string;
  sector: ProjectSectorEnum | 'ALL';
  country: string | 'ALL';
  type: OpportunityTypeEnum | 'ALL';
  deadline: 'all' | '7days' | '30days' | '90days';
}

export interface MatchingTenderFiltersDTO {
  searchInput: string;
  searchMode: 'allWords' | 'anyWords' | 'exactPhrase' | 'boolean';
  selectedProcurementTypes: ProcurementTypeEnum[];
  selectedNoticeTypes: NoticeTypeEnum[];
  publishedFrom?: Date;
  publishedTo?: Date;
  budgetMode: 'any' | 'above' | 'below';
  budgetValue: string;
  hideMultiCountry: boolean;
  selectedSectors: SectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  selectedRegions: RegionEnum[];
  selectedCountries: CountryEnum[];
  selectedFundingAgencies: FundingAgencyEnum[];
  activeType: OpportunityTypeEnum.OPEN_PROJECT | OpportunityTypeEnum.CONTRACT_AWARD | OpportunityTypeEnum.SHORTLIST;
}

export interface MatchingVacancyFiltersDTO {
  searchInput: string;
  status: 'all' | 'active' | 'closing-soon' | 'closed';
  location: string;
  department: string;
  deadline: 'all' | 'urgent' | 'month' | 'expired';
  sort: 'newest' | 'oldest' | 'deadline' | 'title';
  activeType: OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY;
}

export interface CVStatsDTO {
  previewsEN: number;
  downloadsEN: number;
  previewsFR: number;
  downloadsFR: number;
  previewsES: number;
  downloadsES: number;
  registeredDate: Date;
}

export interface SIPInfoDTO {
  isActive: boolean;
  countries: number;
  sectors: number;
  fundingAgencies: number;
  expiryDate: Date;
}

export interface MatchingOpportunitiesContextDTO {
  opportunities: MatchingOpportunityDTO[];
  stats: MatchingStatsDTO;
  cvStats: CVStatsDTO;
  sipInfo: SIPInfoDTO;
  pendingMatches: PendingMatchDTO[];
  savedOpportunities: string[]; // Array of opportunity IDs
}

export interface MatchingProjectsFilterDTO {
  sort: 'relevance' | 'date';
  category: OpportunityTypeEnum | 'ALL';
  country: string | 'ALL';
  minScore: 0 | 50 | 70 | 90;
  dateRange: '5days' | '7days' | '30days' | 'custom';
  customDateFrom?: string; // ISO date string YYYY-MM-DD
  customDateTo?: string;   // ISO date string YYYY-MM-DD
}

export type AlertFrequency = 'realtime' | 'daily' | 'weekly' | 'none';

export interface MatchingProfileDTO {
  id: string;
  name: string;
  sectors: string[];
  countries: string[];
  donors: string[];
  keywords: string[];
  isActive: boolean;
  alertFrequency: AlertFrequency;
  createdAt: Date;
  matchCount: number;
}

export interface AlertProfileSettingsDTO {
  profileId: string;
  isEnabled: boolean;
  frequency: AlertFrequency;
}

export interface AlertFusionConfigDTO {
  globalFrequency: AlertFrequency;
  deduplicationEnabled: boolean;
  profileSettings: AlertProfileSettingsDTO[];
}
