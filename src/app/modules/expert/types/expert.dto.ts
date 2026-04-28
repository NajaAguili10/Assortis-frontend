// Expert Types and DTOs - Multilingue compatible

export enum ExpertStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
}

export enum ExpertLevelEnum {
  JUNIOR = 'JUNIOR',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  EXPERT = 'EXPERT',
  LEAD = 'LEAD',
}

export enum CertificationTypeEnum {
  PMP = 'PMP',
  PRINCE2 = 'PRINCE2',
  AGILE = 'AGILE',
  ITIL = 'ITIL',
  ISO = 'ISO',
  PROFESSIONAL = 'PROFESSIONAL',
  ACADEMIC = 'ACADEMIC',
  TECHNICAL = 'TECHNICAL',
}

export enum AvailabilityEnum {
  IMMEDIATE = 'IMMEDIATE',
  WITHIN_1_MONTH = 'WITHIN_1_MONTH',
  WITHIN_3_MONTHS = 'WITHIN_3_MONTHS',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export enum RegionEnum {
  AFRICA_WEST = 'AFRICA_WEST',
  AFRICA_EAST = 'AFRICA_EAST',
  AFRICA_CENTRAL = 'AFRICA_CENTRAL',
  AFRICA_NORTH = 'AFRICA_NORTH',
  AFRICA_SOUTHERN = 'AFRICA_SOUTHERN',
  ASIA_PACIFIC = 'ASIA_PACIFIC',
  EUROPE = 'EUROPE',
  MIDDLE_EAST = 'MIDDLE_EAST',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  CARIBBEAN = 'CARIBBEAN',
  OCEANIA = 'OCEANIA',
}

// Expert Expertise/Sector
export enum ExpertSectorEnum {
  AGRICULTURE = 'AGRICULTURE',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GOVERNANCE = 'GOVERNANCE',
  ENVIRONMENT = 'ENVIRONMENT',
  ENERGY = 'ENERGY',
  WATER_SANITATION = 'WATER_SANITATION',
  FINANCE = 'FINANCE',
  TECHNOLOGY = 'TECHNOLOGY',
  HUMANITARIAN = 'HUMANITARIAN',
  CLIMATE_CHANGE = 'CLIMATE_CHANGE',
}

export interface CertificationDTO {
  id: string;
  type: CertificationTypeEnum;
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  verified: boolean;
}

export interface ExperienceDTO {
  id: string;
  role: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
  sector: ExpertSectorEnum;
  location: string;
  current: boolean;
}

export interface EducationDTO {
  id: string;
  degree: string;
  field: string;
  institution: string;
  year: string;
  location: string;
}

export interface LanguageSkillDTO {
  language: string;
  level: 'NATIVE' | 'FLUENT' | 'ADVANCED' | 'INTERMEDIATE' | 'BASIC';
}

export type WritingMethodology = 'TA' | 'FWC' | 'Grants';
export type WritingContribution =
  | "Reviewing others' contributions"
  | 'Contributing with technical inputs'
  | 'Writing methodologies in full'
  | 'Proofreading and editing';
export type WritingLanguage = 'English' | 'French' | 'Spanish' | 'Portuguese' | 'German';

export interface WritingExperienceRowDTO {
  id: string;
  titleOfTenderProject: string;
  donor: string;
  country: string;
  year: string;
  indicativePagesWritten: string;
  result: 'won' | 'lost';
  referencePersonProjectManager: string;
  additionalInformation: string;
}

export interface WritingExperienceDTO {
  writingMethodologies: WritingMethodology[];
  writingContributions: WritingContribution[];
  writingLanguages: WritingLanguage[];
  comfortableToWriteOn: string;
  donorProcurementExperience: string;
  writingComments: string;
  writingExperienceRows: WritingExperienceRowDTO[];
}

export interface ExpertProfileDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  status: ExpertStatusEnum;
  level: ExpertLevelEnum;
  availability: AvailabilityEnum;
  profilePicture?: string;
  
  // Location
  country: string;
  city: string;
  region: RegionEnum;
  
  // Professional
  bio: string;
  yearsOfExperience: number;
  dailyRate?: number;
  currency?: string;
  
  // Expertise
  sectors: ExpertSectorEnum[];
  skills: string[];
  languages: LanguageSkillDTO[];
  
  // Certifications & Education
  certifications: CertificationDTO[];
  education: EducationDTO[];
  experience: ExperienceDTO[];
  
  // Stats
  completedMissions: number;
  activeProjects: number;
  clientRating: number;
  responseRate: number;
  
  // Metadata
  profileCompleteness: number;
  verified: boolean;
  lastActive: string;
  joinedDate: string;
  
  // Matching
  matchingScore?: number;

  writingExperience?: WritingExperienceDTO;
}

export interface ExpertListDTO {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  status: ExpertStatusEnum;
  level: ExpertLevelEnum;
  availability: AvailabilityEnum;
  profilePicture?: string;
  
  country: string;
  city: string;
  region: RegionEnum;
  
  bio: string;
  yearsOfExperience: number;
  dailyRate?: number;
  currency?: string;
  
  sectors: ExpertSectorEnum[];
  skills: string[];
  languages: LanguageSkillDTO[];
  
  completedMissions: number;
  clientRating: number;
  
  profileCompleteness: number;
  verified: boolean;
  lastActive: string;
  
  matchingScore?: number;

  writingExperience?: WritingExperienceDTO;
}

export interface CVProfileDTO {
  id: string;
  expertId: string;
  fileName: string;
  uploadedDate: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedData?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
  matchingScore?: number;
}

export interface ExpertMatchingDTO {
  id: string;
  expertId: string;
  expert: ExpertListDTO;
  torId: string;
  torTitle: string;
  matchingScore: number;
  status: 'PENDING' | 'INVITED' | 'ACCEPTED' | 'REJECTED';
  matchedDate: string;
  invitationSent?: string;
  response?: string;
  matchingReasons: {
    skills: number;
    experience: number;
    sector: number;
    location: number;
    availability: number;
  };
}

export interface ExpertKPIsDTO {
  totalExperts: number;
  availableExperts: number;
  certifiedExperts: number;
  activeMissions: number;
  pendingMatches: number;
  averageMatchingRate: number;
  cvProcessed: number;
  verifiedProfiles: number;
}

export interface ExpertFiltersDTO {
  searchQuery?: string;
  status?: ExpertStatusEnum[];
  level?: ExpertLevelEnum[];
  sector?: ExpertSectorEnum[];
  region?: RegionEnum[];
  availability?: AvailabilityEnum[];
  minExperience?: number;
  maxExperience?: number;
  minRating?: number;
  verified?: boolean;
  certifications?: CertificationTypeEnum[];
  languages?: string[];
  minDailyRate?: number;
  maxDailyRate?: number;
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}
