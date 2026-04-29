import { apiClient } from '../api/apiClient';

export type PartnershipType = 'strategic' | 'operational' | 'consortium' | 'collaboration';
export type PartnershipStatus = 'active' | 'pending' | 'completed' | 'terminated';

export interface PartnershipListItem {
  id: string;
  organizationName: string;
  organizationType: string;
  partnershipType: PartnershipType;
  status: PartnershipStatus;
  startDate: string;
  endDate?: string;
  sector: string;
  region: string;
  projectsCount: number;
  tenderReference?: string;
  tenderTitle?: string;
  projectCode?: string;
  projectTitle?: string;
  description?: string;
}

type PartnershipApiRecord = {
  id?: string | number;
  organizationName?: string;
  organizationType?: string;
  partnerOrganizationName?: string;
  partnerOrganizationType?: string;
  type?: string;
  partnershipType?: string;
  status?: string;
  startDate?: string;
  endDate?: string | null;
  sector?: string;
  region?: string;
  projectsCount?: number;
  projectCount?: number;
  tenderReference?: string;
  tenderTitle?: string;
  projectCode?: string;
  projectTitle?: string;
  description?: string;
  organization?: Record<string, any>;
  partnerOrganization?: Record<string, any>;
  project?: Record<string, any>;
  tender?: Record<string, any>;
  projects?: unknown[];
  [key: string]: any;
};

const normalizePartnershipType = (value?: string): PartnershipType => {
  const normalized = value?.trim().toLowerCase().replace(/[\s_-]+/g, '-') ?? '';

  switch (normalized) {
    case 'strategic':
      return 'strategic';
    case 'operational':
      return 'operational';
    case 'consortium':
      return 'consortium';
    case 'programmatic':
    case 'project':
    case 'project-based':
    case 'projectbased':
    case 'collaboration':
    default:
      return 'collaboration';
  }
};

const normalizePartnershipStatus = (value?: string): PartnershipStatus => {
  const normalized = value?.trim().toLowerCase() ?? '';

  switch (normalized) {
    case 'pending':
      return 'pending';
    case 'completed':
      return 'completed';
    case 'terminated':
    case 'inactive':
    case 'cancelled':
    case 'canceled':
      return 'terminated';
    case 'active':
    default:
      return 'active';
  }
};

const getFirstString = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const getProjectsCount = (record: PartnershipApiRecord) => {
  if (typeof record.projectsCount === 'number') {
    return record.projectsCount;
  }

  if (typeof record.projectCount === 'number') {
    return record.projectCount;
  }

  if (Array.isArray(record.projects)) {
    return record.projects.length;
  }

  return 0;
};

const normalizePartnership = (record: PartnershipApiRecord): PartnershipListItem => {
  const organization = record.organization ?? {};
  const partnerOrganization = record.partnerOrganization ?? {};
  const project = record.project ?? {};
  const tender = record.tender ?? {};
  const partnershipType = normalizePartnershipType(record.type ?? record.partnershipType);

  return {
    id: String(record.id ?? ''),
    organizationName: getFirstString(
      record.partnerOrganizationName,
      partnerOrganization.name,
      record.organizationName,
      organization.name,
      'Unknown organization',
    ),
    organizationType: getFirstString(
      record.partnerOrganizationType,
      partnerOrganization.type,
      record.organizationType,
      organization.type,
    ),
    partnershipType,
    status: normalizePartnershipStatus(record.status),
    startDate: getFirstString(record.startDate, record.createdAt, new Date().toISOString()),
    endDate: getFirstString(record.endDate),
    sector: getFirstString(
      record.sector,
      partnerOrganization.mainSector,
      organization.mainSector,
      project.mainSector,
      'N/A',
    ),
    region: getFirstString(
      record.region,
      partnerOrganization.region,
      organization.region,
      partnerOrganization.country?.name,
      organization.country?.name,
      'N/A',
    ),
    projectsCount: getProjectsCount(record),
    tenderReference: getFirstString(record.tenderReference, tender.reference, tender.referenceNumber),
    tenderTitle: getFirstString(record.tenderTitle, tender.title, tender.name),
    projectCode: getFirstString(record.projectCode, project.code, project.reference),
    projectTitle: getFirstString(record.projectTitle, project.title, project.name),
    description: getFirstString(record.description),
  };
};

const extractPartnerships = (response: PartnershipApiRecord[] | { data?: PartnershipApiRecord[]; items?: PartnershipApiRecord[]; content?: PartnershipApiRecord[] }) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

export const partnershipService = {
  getPartnerships: async () => {
    const response = await apiClient.get<
      PartnershipApiRecord[] | { data?: PartnershipApiRecord[]; items?: PartnershipApiRecord[]; content?: PartnershipApiRecord[] }
    >('/partnerships');

    return extractPartnerships(response)
      .map(normalizePartnership)
      .filter((partnership) => partnership.id);
  },
};
