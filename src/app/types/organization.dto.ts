// Organization DTOs for multilingual support
import { SubSectorEnum } from './tender.dto';

export enum OrganizationTypeEnum {
  NGO = 'NGO',
  INTERNATIONAL_ORG = 'INTERNATIONAL_ORG',
  GOVERNMENT = 'GOVERNMENT',
  GOVERNMENT_AGENCY = 'GOVERNMENT_AGENCY',
  PRIVATE_SECTOR = 'PRIVATE_SECTOR',
  ACADEMIC = 'ACADEMIC',
  RESEARCH_INSTITUTION = 'RESEARCH_INSTITUTION',
  FOUNDATION = 'FOUNDATION',
  CONSORTIUM = 'CONSORTIUM',
}

export enum OrganizationSectorEnum {
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  AGRICULTURE = 'AGRICULTURE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GOVERNANCE = 'GOVERNANCE',
  ENVIRONMENT = 'ENVIRONMENT',
  WATER_SANITATION = 'WATER_SANITATION',
  ENERGY = 'ENERGY',
  GENDER = 'GENDER',
  YOUTH = 'YOUTH',
  HUMANITARIAN = 'HUMANITARIAN',
  FINANCE = 'FINANCE',
  TECHNOLOGY = 'TECHNOLOGY',
  CULTURE = 'CULTURE',
  TRADE = 'TRADE',
}

export enum OrganizationStatusEnum {
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  INACTIVE = 'INACTIVE',
}

export enum RegionEnum {
  AFRICA = 'AFRICA',
  ASIA = 'ASIA',
  EUROPE = 'EUROPE',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  LATIN_AMERICA = 'LATIN_AMERICA',
  OCEANIA = 'OCEANIA',
  MIDDLE_EAST = 'MIDDLE_EAST',
}

export interface Organization {
  id: string;
  name: string;
  acronym?: string;
  type: OrganizationTypeEnum;
  sectors: OrganizationSectorEnum[];
  subSectors?: SubSectorEnum[];
  status: OrganizationStatusEnum;
  region: RegionEnum;
  country: string;
  city?: string;
  description: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  yearEstablished?: number;
  employeeCount?: number;
  activeProjects: number;
  completedProjects: number;
  partnerships: number;
  certifications: string[];
  budget?: {
    amount: number;
    currency: string;
    formatted: string;
  };
  teamMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationKPIs {
  totalOrganizations: number;
  activeOrganizations: number;
  verifiedOrganizations: number;
  partnerships: number;
  newPartnerships: number;
  countriesCovered: number;
  invitations: number;
  pendingInvitations: number;
}

export interface OrganizationFilters {
  searchQuery?: string;
  type?: OrganizationTypeEnum[];
  sectors?: OrganizationSectorEnum[];
  subSectors?: SubSectorEnum[];
  status?: OrganizationStatusEnum[];
  region?: RegionEnum[];
  country?: string[];
}

export interface PaginatedOrganizations {
  data: Organization[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export enum PartnershipStatusEnum {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  INACTIVE = 'INACTIVE',
}

export interface Partnership {
  id: string;
  organizationId: string;
  organizationName: string;
  partnerOrganizationId: string;
  partnerOrganizationName: string;
  partnerLogo?: string;
  status: PartnershipStatusEnum;
  startDate: Date;
  endDate?: Date;
  projectsCount: number;
  description?: string;
  sectors: OrganizationSectorEnum[];
}

export enum TeamMemberRoleEnum {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRoleEnum;
  avatar?: string;
  position?: string;
  department?: string;
  joinedAt: Date;
  isActive: boolean;
}

export enum OrganizationInvitationStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export interface OrganizationInvitation {
  id: string;
  fromOrganizationId: string;
  fromOrganizationName: string;
  toOrganizationId: string;
  toOrganizationName: string;
  type: 'PARTNERSHIP' | 'TEAM' | 'PROJECT';
  status: OrganizationInvitationStatusEnum;
  projectReference?: string;
  projectName?: string;
  message?: string;
  sentAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
}