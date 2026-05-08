/**
 * DTO Types for Mon Espace (Job Offers) Module
 * Based on 19_DTO_ARCHITECTURE.md
 */

export enum JobOfferTypeEnum {
  PROJECT_LINKED = 'PROJECT_LINKED',
  PROJECT_NEW = 'PROJECT_NEW',
  PROJECT = 'PROJECT',
  INTERNAL = 'INTERNAL'
}

export type JobOfferApplicationMethod = 'CONTACT_PERSON' | 'EXTERNAL_LINK';

export enum JobOfferStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

/**
 * JobOfferListDTO - Minimal data for list/card display
 */
export interface JobOfferListDTO {
  id: string;
  publishOnBoard?: boolean;
  linkedProjectId?: string;
  jobTitle: string;
  location: string;
  projectTitle?: string;
  projectSummary?: string;
  logoUrl?: string;
  jobFunction?: string;
  otherFunction?: string;
  department?: string;
  type: JobOfferTypeEnum;
  duration: string;
  contractDurationDays?: number;
  overDurationDays?: boolean;
  description?: string;
  descriptionPlainText?: string;
  sectors?: string[];
  subSectors?: string[];
  regions?: string[];
  countries?: string[];
  cities?: string[];
  customCities?: string[];
  homeBased?: boolean;
  seniority?: string;
  restrictions?: string;
  estimatedStartDate?: string;
  applicationLink?: string;
  applicationUrl?: string;
  deadlineTime?: string;
  applicationMethod?: JobOfferApplicationMethod;
  contactPersonFunction?: string;
  publishedAt: string;
  deadline: string;
  status: JobOfferStatusEnum;
  daysRemaining: number;
  organizationName?: string;
  recruiterId: string;
  applicationsCount?: number;
  requirements?: string[] | string;
}

/**
 * JobOfferDetailDTO - Complete data for detail view
 */
export interface JobOfferDetailDTO extends JobOfferListDTO {
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  contactEmail?: string;
  contactPerson?: string;
  contactPersonFunction?: string;
  applicationUrl?: string;
  totalApplications?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobLanguageRequirement {
  name: string;
  writtenLevel: string;
  spokenLevel: string;
}

/**
 * JobOfferCreateDTO - Data needed to create a job offer
 */
export interface JobOfferCreateDTO {
  publishOnBoard?: boolean;
  linkedProjectId?: string;

  // Organisation Details
  organisationName?: string;
  website?: string;
  logoUrl?: string;

  // Vacancy Details
  jobTitle: string;
  jobFunction: string;
  otherFunction?: string;
  regions?: string[];
  countries?: string[];
  cities?: string[];
  customCities?: string[];
  subSectors?: string[];
  sectors?: string[];
  homeBased?: boolean;

  // Legacy fields kept for compatibility
  location: string;
  projectTitle?: string;
  projectSummary?: string;
  projectDescription?: string;
  projectDescriptionPlainText?: string;
  projectSectors?: string[];
  projectCountries?: string[];
  projectCategories?: string[];
  department?: string;
  type: JobOfferTypeEnum;
  duration: string;
  contractDurationDays?: number;
  overDurationDays?: boolean;
  seniority?: string;
  restrictions?: string;

  // Languages
  languages?: JobLanguageRequirement[];

  // Vacancy Text
  description: string;
  descriptionPlainText?: string;

  // Application Details
  deadline: string;
  deadlineTime?: string;
  applicationLink?: string;
  estimatedStartDate?: string;
  applicationMethod?: JobOfferApplicationMethod;
  privacyPolicyAccepted?: boolean;

  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  contactEmail?: string;
  contactPerson?: string;
  contactPersonFunction?: string;
}
