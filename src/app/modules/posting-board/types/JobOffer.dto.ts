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
  requirements?: string;
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

/**
 * JobOfferCreateDTO - Data needed to create a job offer
 */
export interface JobOfferCreateDTO {
  jobTitle: string;
  location: string;
  projectTitle?: string;
  department?: string;
  type: JobOfferTypeEnum;
  duration: string;
  description: string;
  deadline: string;
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