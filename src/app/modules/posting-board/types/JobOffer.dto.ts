/**
 * DTO Types for Mon Espace (Job Offers) Module
 * Based on 19_DTO_ARCHITECTURE.md
 */

export enum JobOfferTypeEnum {
  PROJECT = 'PROJECT',
  INTERNAL = 'INTERNAL'
}

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
  jobTitle: string;
  location: string;
  projectTitle?: string;
  department?: string;
  type: JobOfferTypeEnum;
  duration: string;
  description?: string;
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

  // Legacy fields kept for compatibility
  location: string;
  projectTitle?: string;
  department?: string;
  type: JobOfferTypeEnum;
  duration: string;

  // Languages
  languages?: JobLanguageRequirement[];

  // Vacancy Text
  description: string;

  // Application Details
  deadline: string;
  deadlineTime?: string;
  applicationLink?: string;
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
}