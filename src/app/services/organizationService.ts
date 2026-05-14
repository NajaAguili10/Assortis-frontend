import { apiClient } from '../api/apiClient';
import {
  OrganizationFilters,
  PaginatedOrganizations,
  Organization,
  OrganizationBackend,
  OrganizationSectorEnum,
  RegionEnum,
  SectorDTO,
  CountryDTO,
  SubsectorDTO,
} from '../types/organization.dto';

const COUNTRY_REGION_MAP: Record<string, RegionEnum> = {
  AF: RegionEnum.SOUTH_ASIA,
  AE: RegionEnum.MIDDLE_EAST,
  AR: RegionEnum.SOUTH_AMERICA,
  AL: RegionEnum.SOUTHEASTERN_EUROPE,
  AM: RegionEnum.CENTRAL_ASIA,
  AT: RegionEnum.WESTERN_EUROPE,
  AU: RegionEnum.OCEANIA,
  BA: RegionEnum.SOUTHEASTERN_EUROPE,
  BD: RegionEnum.SOUTH_ASIA,
  BE: RegionEnum.WESTERN_EUROPE,
  BF: RegionEnum.WEST_AFRICA,
  BG: RegionEnum.SOUTHEASTERN_EUROPE,
  BH: RegionEnum.MIDDLE_EAST,
  BI: RegionEnum.EAST_AFRICA,
  BJ: RegionEnum.WEST_AFRICA,
  BO: RegionEnum.SOUTH_AMERICA,
  BW: RegionEnum.SOUTHERN_AFRICA,
  BR: RegionEnum.SOUTH_AMERICA,
  CG: RegionEnum.CENTRAL_AFRICA,
  CA: RegionEnum.NORTH_AMERICA,
  CF: RegionEnum.CENTRAL_AFRICA,
  CD: RegionEnum.CENTRAL_AFRICA,
  CH: RegionEnum.WESTERN_EUROPE,
  CM: RegionEnum.CENTRAL_AFRICA,
  CN: RegionEnum.NORTHEAST_ASIA,
  CR: RegionEnum.CENTRAL_AMERICA,
  CZ: RegionEnum.CENTRAL_EASTERN_EUROPE,
  DE: RegionEnum.WESTERN_EUROPE,
  DZ: RegionEnum.NORTH_AFRICA,
  EG: RegionEnum.NORTH_AFRICA,
  ES: RegionEnum.WESTERN_EUROPE,
  ET: RegionEnum.EAST_AFRICA,
  FJ: RegionEnum.OCEANIA,
  FR: RegionEnum.WESTERN_EUROPE,
  GA: RegionEnum.CENTRAL_AFRICA,
  GB: RegionEnum.WESTERN_EUROPE,
  GE: RegionEnum.CENTRAL_ASIA,
  GH: RegionEnum.WEST_AFRICA,
  GT: RegionEnum.CENTRAL_AMERICA,
  HR: RegionEnum.SOUTHEASTERN_EUROPE,
  HU: RegionEnum.CENTRAL_EASTERN_EUROPE,
  ID: RegionEnum.SOUTHEAST_ASIA,
  IN: RegionEnum.SOUTH_ASIA,
  IQ: RegionEnum.MIDDLE_EAST,
  IT: RegionEnum.WESTERN_EUROPE,
  JO: RegionEnum.MIDDLE_EAST,
  JP: RegionEnum.NORTHEAST_ASIA,
  KE: RegionEnum.EAST_AFRICA,
  KG: RegionEnum.CENTRAL_ASIA,
  KH: RegionEnum.SOUTHEAST_ASIA,
  KP: RegionEnum.NORTHEAST_ASIA,
  KR: RegionEnum.NORTHEAST_ASIA,
  KW: RegionEnum.MIDDLE_EAST,
  KZ: RegionEnum.CENTRAL_ASIA,
  LB: RegionEnum.MIDDLE_EAST,
  LK: RegionEnum.SOUTH_ASIA,
  LY: RegionEnum.NORTH_AFRICA,
  MA: RegionEnum.NORTH_AFRICA,
  ME: RegionEnum.SOUTHEASTERN_EUROPE,
  ML: RegionEnum.WEST_AFRICA,
  MM: RegionEnum.SOUTHEAST_ASIA,
  MN: RegionEnum.NORTHEAST_ASIA,
  MX: RegionEnum.CENTRAL_AMERICA,
  MY: RegionEnum.SOUTHEAST_ASIA,
  MZ: RegionEnum.SOUTHERN_AFRICA,
  NA: RegionEnum.SOUTHERN_AFRICA,
  NE: RegionEnum.WEST_AFRICA,
  NG: RegionEnum.WEST_AFRICA,
  NI: RegionEnum.CENTRAL_AMERICA,
  NL: RegionEnum.WESTERN_EUROPE,
  NP: RegionEnum.SOUTH_ASIA,
  NZ: RegionEnum.OCEANIA,
  OM: RegionEnum.MIDDLE_EAST,
  PA: RegionEnum.CENTRAL_AMERICA,
  PE: RegionEnum.SOUTH_AMERICA,
  PG: RegionEnum.OCEANIA,
  PH: RegionEnum.SOUTHEAST_ASIA,
  PK: RegionEnum.SOUTH_ASIA,
  PL: RegionEnum.CENTRAL_EASTERN_EUROPE,
  PT: RegionEnum.WESTERN_EUROPE,
  PS: RegionEnum.MIDDLE_EAST,
  PY: RegionEnum.SOUTH_AMERICA,
  QA: RegionEnum.MIDDLE_EAST,
  RS: RegionEnum.SOUTHEASTERN_EUROPE,
  RW: RegionEnum.EAST_AFRICA,
  SA: RegionEnum.MIDDLE_EAST,
  SE: RegionEnum.WESTERN_EUROPE,
  SG: RegionEnum.SOUTHEAST_ASIA,
  SI: RegionEnum.CENTRAL_EASTERN_EUROPE,
  SK: RegionEnum.CENTRAL_EASTERN_EUROPE,
  SO: RegionEnum.EAST_AFRICA,
  SN: RegionEnum.WEST_AFRICA,
  SV: RegionEnum.CENTRAL_AMERICA,
  TD: RegionEnum.CENTRAL_AFRICA,
  TG: RegionEnum.WEST_AFRICA,
  TH: RegionEnum.SOUTHEAST_ASIA,
  TJ: RegionEnum.CENTRAL_ASIA,
  TM: RegionEnum.CENTRAL_ASIA,
  TN: RegionEnum.NORTH_AFRICA,
  TZ: RegionEnum.EAST_AFRICA,
  UA: RegionEnum.CENTRAL_EASTERN_EUROPE,
  UG: RegionEnum.EAST_AFRICA,
  US: RegionEnum.NORTH_AMERICA,
  UZ: RegionEnum.CENTRAL_ASIA,
  VN: RegionEnum.SOUTHEAST_ASIA,
  YE: RegionEnum.MIDDLE_EAST,
  ZA: RegionEnum.SOUTHERN_AFRICA,
  ZM: RegionEnum.SOUTHERN_AFRICA,
  ZW: RegionEnum.SOUTHERN_AFRICA,
};

const normalizeOrganizationType = (type?: string) => {
  if (!type) return '';

  const normalized = type.toUpperCase().replace(/[\s-]+/g, '_');

  if (normalized === 'INTERNATIONAL_ORGANIZATION') {
    return 'INTERNATIONAL_ORG';
  }

  if (normalized === 'ACADEMIC_INSTITUTION') {
    return 'ACADEMIC';
  }

  if (normalized === 'NON_GOVERNMENTAL_ORGANIZATION') {
    return 'NGO';
  }

  return normalized;
};

const mapFormOrganizationTypeToBackend = (type?: string) => {
  switch (type) {
    case 'ngo':
      return 'NGO';
    case 'government':
      return 'GOVERNMENT';
    case 'academic':
      return 'ACADEMIC';
    case 'consortium':
      return 'CONSORTIUM';
    case 'donor':
      return 'FOUNDATION';
    case 'serviceProvider':
    case 'company':
    case 'privateOrg':
      return 'PRIVATE_SECTOR';
    default:
      return normalizeOrganizationType(type);
  }
};

const getDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(getDisplayValue).filter(Boolean).join(' ');
  if (typeof value === 'object') return value.code || value.name || value.label || value.value || '';
  return '';
};

const getBudgetAmount = (budget: any): number => {
  if (typeof budget === 'number') return budget;
  if (budget && typeof budget.amount === 'number') return budget.amount;
  return 0;
};

const getNormalizedCode = (value: any): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value.toUpperCase().replace(/[\s-]+/g, '_');
  if (typeof value === 'object') {
    const code = value.code || value.name || value.label || value.value;
    return typeof code === 'string' ? code.toUpperCase().replace(/[\s-]+/g, '_') : undefined;
  }
  return undefined;
};

const getNormalizedStatus = (org: Organization): string | undefined => {
  if (org.status) return org.status.toUpperCase();
  if (org.verificationStatus) return org.verificationStatus.toUpperCase();
  return undefined;
};

const normalizeSectorCode = (sector?: string | null) => {
  if (!sector) return '';
  return sector.toUpperCase().replace(/[\s&/-]+/g, '_');
};

const normalizeSectors = (org: OrganizationBackend): SectorDTO[] => {
  if (Array.isArray(org.sectors) && org.sectors.length > 0) {
    return org.sectors
      .filter((sector): sector is SectorDTO => Boolean(sector?.code && sector?.name))
      .map((sector) => ({
        id: sector.id,
        code: normalizeSectorCode(sector.code || sector.name),
        name: sector.name,
      }));
  }

  if (org.mainSector && typeof org.mainSector === 'object' && 'code' in org.mainSector) {
    const normalizedCode = normalizeSectorCode(org.mainSector.code || org.mainSector.name);
    if (Object.values(OrganizationSectorEnum).includes(normalizedCode as OrganizationSectorEnum)) {
      return [{
        id: org.mainSector.id,
        code: normalizedCode,
        name: org.mainSector.name,
      }];
    }
  }

  const normalizedCode = normalizeSectorCode(typeof org.mainSector === 'string' ? org.mainSector : null);
  if (Object.values(OrganizationSectorEnum).includes(normalizedCode as OrganizationSectorEnum)) {
    return [{
      id: 0,
      code: normalizedCode,
      name: normalizedCode.replace(/_/g, ' '),
    }];
  }

  return [];
};

const normalizeSubsectors = (org: OrganizationBackend): SubsectorDTO[] => {
  if (!Array.isArray(org.subsectors)) {
    return [];
  }

  return org.subsectors
    .filter((subsector): subsector is SubsectorDTO => Boolean(subsector?.code && subsector?.name))
    .map((subsector) => ({
      id: subsector.id,
      code: subsector.code,
      name: subsector.name,
      description: subsector.description,
      sectorId: subsector.sectorId,
    }));
};

const normalizeRegion = (backendOrg: Organization): RegionEnum | undefined => {
  const backendRegion = getDisplayValue(backendOrg.region).toUpperCase().replace(/[\s-]+/g, '_');

  if (backendRegion && Object.values(RegionEnum).includes(backendRegion as RegionEnum)) {
    return backendRegion as RegionEnum;
  }

  const countryCode = backendOrg.country?.code?.toUpperCase();
  return countryCode ? COUNTRY_REGION_MAP[countryCode] : undefined;
};

const normalizeOrganization = (org: Organization): Organization => {
  const budgetAmount = typeof org.annualTurnover === 'number' ? org.annualTurnover : undefined;
  const sectors = normalizeSectors(org);

  return {
    id: org.id.toString(),
    name: org.name,
    cleanName: org.cleanName,
    acronym: org.acronym,
    type: normalizeOrganizationType(org.type),
    description: org.description || '',
    website: org.website,
    email: org.contactEmail,
    contactEmail: org.contactEmail,
    isActive: org.isActive,
    status: org.verificationStatus || (org.isActive ? 'ACTIVE' : 'INACTIVE'),
    verificationStatus: org.verificationStatus,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    legalName: org.legalName,
    logoUrl: org.logoUrl,
    city: org.city ? { id: org.city.id, name: org.city.name } : undefined,
    country: org.country ? { id: org.country.id, name: org.country.name, code: org.country.code } : undefined,
    region: normalizeRegion(org),
    mainSector: sectors[0],
    sectors,
    subSectors: normalizeSubsectors(org),
    activeProjects: org.activeProjects ?? 0,
    completedProjects: org.completedProjects ?? 0,
    partnerships: org.partnerships ?? 0,
    employeeCount: org.employeesCount ?? undefined,
    yearEstablished: org.yearFounded ?? undefined,
    teamMembers: org.teamMembers ?? org.employeesCount ?? undefined,
    budget: budgetAmount,
    certifications: Array.isArray(org.certifications) ? org.certifications : [],
    equipmentInfrastructure: org.equipmentInfrastructure,
  };
};

const applyFiltersAndSort = (
  organizations: Organization[],
  filters?: OrganizationFilters,
  sortBy?: string,
) => {
  let filtered = [...organizations];

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter((org) =>
      (org.name?.toLowerCase().includes(query) ?? false) ||
      (org.acronym?.toLowerCase().includes(query) ?? false) ||
      (org.description?.toLowerCase().includes(query) ?? false),
    );
  }

  if (filters?.keywords) {
    const query = filters.keywords.toLowerCase();
    filtered = filtered.filter((org) =>
      org.name.toLowerCase().includes(query) ||
      org.acronym?.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query) ||
      (org.sectors || []).some((sector) => getDisplayValue(sector).toLowerCase().includes(query)),
    );
  }

  if (filters?.city) {
    const query = filters.city.toLowerCase();
    filtered = filtered.filter((org) => {
      const city = typeof org.city === 'string' ? org.city : org.city?.name;
      return city?.toLowerCase().includes(query);
    });
  }

  if (filters?.officeLocation) {
    const query = filters.officeLocation.toLowerCase();
    filtered = filtered.filter((org) => {
      const city = typeof org.city === 'string' ? org.city : org.city?.name;
      const country = typeof org.country === 'string' ? org.country : org.country?.name;
      return `${city || ''} ${country || ''} ${org.region || ''}`.toLowerCase().includes(query);
    });
  }

  if (filters?.projectBudget) {
    const budget = Number(filters.projectBudget);
    if (!Number.isNaN(budget)) {
      filtered = filtered.filter((org) => getBudgetAmount(org.budget) >= budget);
    }
  }

  if (filters?.publishedFrom) {
    const from = new Date(filters.publishedFrom).getTime();
    if (!Number.isNaN(from)) {
      filtered = filtered.filter((org) => new Date(org.createdAt).getTime() >= from);
    }
  }

  if (filters?.publishedTo) {
    const to = new Date(filters.publishedTo).getTime();
    if (!Number.isNaN(to)) {
      filtered = filtered.filter((org) => new Date(org.createdAt).getTime() <= to);
    }
  }

  if (filters?.type?.length) {
    filtered = filtered.filter((org) => filters.type!.includes(org.type as any));
  }

  if (filters?.procurementType) {
    const query = filters.procurementType.toLowerCase();
    filtered = filtered.filter((org) =>
      org.type?.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query) ||
      (org.sectors || []).some((sector) => getDisplayValue(sector).toLowerCase().includes(query)),
    );
  }

  if (filters?.status?.length) {
    filtered = filtered.filter((org) => {
      const verificationStatus = org.verificationStatus?.toUpperCase();
      const status = getNormalizedStatus(org);

      return filters.status!.some((filterStatus) => {
        const normalizedFilter = filterStatus.toUpperCase();

        if (normalizedFilter === 'ACTIVE') {
          return status === 'ACTIVE';
        }

        return normalizedFilter === status || normalizedFilter === verificationStatus;
      });
    });
  }

  if (filters?.sectors?.length) {
    filtered = filtered.filter((org) =>
      (org.sectors || []).some((orgSector) => 
        filters.sectors!.some(s => getNormalizedCode(s) === getNormalizedCode(orgSector))
      ),
    );
  }

  if (filters?.subSectors?.length) {
    filtered = filtered.filter((org) =>
      (org.subSectors || []).some((orgSub) => 
        filters.subSectors!.some(s => getNormalizedCode(s) === getNormalizedCode(orgSub))
      ),
    );
  }

  const regionFilters = filters?.regions || filters?.region;
  if (regionFilters?.length) {
    filtered = filtered.filter((org) => org.region && regionFilters.includes(org.region as RegionEnum));
  }

  const countryFilters = filters?.countries;
  if (countryFilters?.length) {
    filtered = filtered.filter((org) => {
      const orgCountryCode = getNormalizedCode(org.country);
      return orgCountryCode ? countryFilters.some(c => c.code === orgCountryCode) : false;
    });
  }

  switch (sortBy) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'partnerships':
      filtered.sort((a, b) => (b.partnerships || 0) - (a.partnerships || 0));
      break;
    case 'projects':
      filtered.sort(
        (a, b) =>
          ((b.activeProjects || 0) + (b.completedProjects || 0)) -
          ((a.activeProjects || 0) + (a.completedProjects || 0)),
      );
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return filtered;
};

const fetchOrganizations = async () => {
  const response = await apiClient.get<OrganizationBackend[] | { data?: OrganizationBackend[]; items?: OrganizationBackend[] }>('/organizations');

  const rawOrganizations = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.items)
        ? response.items
        : [];

  return rawOrganizations.map(normalizeOrganization);
};

const normalizeCurrentOrganizationProfile = (org: OrganizationBackend) => ({
  id: String(org.id),
  name: org.name || '',
  acronym: org.acronym || '',
  type: normalizeOrganizationType(org.type),
  legalName: org.legalName || '',
  registrationNumber: org.registrationNumber || '',
  yearFounded: org.yearFounded ?? null,
  description: org.description || '',
  email: org.contactEmail || '',
  phone: org.contactPhone || '',
  website: org.website || '',
  address: org.address || '',
  city: org.city?.name || '',
  country: org.country?.name || '',
  postalCode: org.postalCode || '',
  region: org.region?.toUpperCase().replace(/[\s-]+/g, '_') || '',
  operatingRegions: Array.isArray(org.operatingRegions)
    ? org.operatingRegions.filter(Boolean)
    : org.region
      ? [org.region.toUpperCase().replace(/[\s-]+/g, '_')]
      : [],
  sectors: Array.isArray(org.sectors)
    ? org.sectors.map((sector) => sector?.code || sector?.name).filter(Boolean)
    : normalizeSectors(org).map((sector) => sector.code),
  sectorLabels: Array.isArray(org.sectors)
    ? Object.fromEntries(
      org.sectors
        .filter((sector) => (sector?.code || sector?.name) && sector?.name)
        .map((sector) => [sector.code || sector.name, sector.name]),
    )
    : {},
  subsectors: Array.isArray(org.subsectors)
    ? org.subsectors.map((subsector) => subsector?.code || subsector?.name).filter(Boolean)
    : [],
  subsectorLabels: Array.isArray(org.subsectors)
    ? Object.fromEntries(
      org.subsectors
        .filter((subsector) => (subsector?.code || subsector?.name) && subsector?.name)
        .map((subsector) => [subsector.code || subsector.name, subsector.name]),
    )
    : {},
  languages: Array.isArray(org.languages) ? org.languages.filter(Boolean) : [],
  services: Array.isArray(org.services) ? org.services.filter(Boolean) : [],
  teamSize: org.employeesCount ?? org.teamMembers ?? 0,
  experts: org.teamMembers ?? 0,
  annualBudget: typeof org.annualTurnover === 'number' ? org.annualTurnover : 0,
  projectsCompleted: org.completedProjects ?? 0,
  activeProjects: org.activeProjects ?? 0,
  budget: typeof org.annualTurnover === 'number'
    ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(org.annualTurnover)
    : '-',
  totalBudget: typeof org.budget === 'number'
    ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(org.budget)
    : '-',
  employees: org.employeesCount != null ? String(org.employeesCount) : '-',
  technicalCapacity: org.equipmentInfrastructure ? 'Available' : '-',
  equipment: org.equipmentInfrastructure || '-',
  certifications: Array.isArray(org.certifications)
    ? org.certifications.map((certification) => certification.certificationName).filter(Boolean)
    : [],
  partnerships: Array.isArray(org.partnershipNames) ? org.partnershipNames.filter(Boolean) : [],
  selectedServices: Array.isArray(org.services) ? org.services.filter(Boolean) : [],
  status: org.verificationStatus || (org.isActive ? 'ACTIVE' : 'INACTIVE'),
  successRate: '-',
});

const buildCurrentOrganizationUpdatePayload = (formData: {
  orgName: string;
  acronym: string;
  orgType: string;
  legalName: string;
  registrationNumber: string;
  foundedYear: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  operatingRegions: string[];
  selectedSector: string[];
  subsectors: string[];
  languages: string[];
  teamSize: string;
  annualBudget: string;
  projectsCompleted: string;
  selectedServices: string[];
}) => ({
  name: formData.orgName,
  acronym: formData.acronym,
  type: mapFormOrganizationTypeToBackend(formData.orgType),
  legalName: formData.legalName,
  registrationNumber: formData.registrationNumber,
  yearFounded: formData.foundedYear ? parseInt(formData.foundedYear, 10) : null,
  description: formData.description,
  contactEmail: formData.email,
  contactPhone: formData.phone,
  website: formData.website,
  address: formData.address,
  city: formData.city,
  country: formData.country,
  postalCode: formData.postalCode,
  operatingRegions: formData.operatingRegions,
  region: formData.operatingRegions[0] || '',
  sectors: formData.selectedSector,
  subsectors: formData.subsectors,
  languages: formData.languages,
  employeesCount: formData.teamSize ? parseInt(formData.teamSize, 10) : 0,
  annualTurnover: formData.annualBudget ? parseInt(formData.annualBudget, 10) : 0,
  projectsCompleted: formData.projectsCompleted ? parseInt(formData.projectsCompleted, 10) : 0,
  services: formData.selectedServices,
});

export const organizationService = {
  getOrganizationsList: async (filters?: OrganizationFilters, sortBy?: string) => {
    try {
      const organizations = await fetchOrganizations();
      return applyFiltersAndSort(organizations, filters, sortBy);
    } catch (error) {
      console.error('Error in getOrganizationsList:', error);
      throw error;
    }

  },

  getAllOrganizationsByOrganization: async (
    filters?: OrganizationFilters,
    page: number = 1,
    pageSize: number = 10,
    sortBy?: string,
  ) => {
    try {
      const filtered = await organizationService.getOrganizationsList(filters, sortBy);

      const totalItems = filtered.length;
      const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        meta: {
          currentPage: page,
          pageSize,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      } as PaginatedOrganizations;
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      throw error;
    }
  },

  getKPIs: async () => {
    return apiClient.get('/organizations/kpis');
  },

  getCurrentOrganizationProfile: async () => {
    const response = await apiClient.get<OrganizationBackend>('/organizations/me');
    return normalizeCurrentOrganizationProfile(response);
  },

  updateCurrentOrganizationProfile: async (formData: {
    orgName: string;
    acronym: string;
    orgType: string;
    legalName: string;
    registrationNumber: string;
    foundedYear: string;
    description: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    operatingRegions: string[];
    selectedSector: string[];
    subsectors: string[];
    languages: string[];
    teamSize: string;
    annualBudget: string;
    projectsCompleted: string;
    selectedServices: string[];
  }) => {
    const response = await apiClient.put<OrganizationBackend>(
      '/organizations/me',
      buildCurrentOrganizationUpdatePayload(formData),
    );
    return normalizeCurrentOrganizationProfile(response);
  },

  getFilters: async () => {
    return apiClient.get('/organizations/filters');
  },
  getSectors: async () => {
    return apiClient.get('/sectors');
  },
  getSubSectors: async () => {
    return apiClient.get('/sectors/subsectors');
  },
  getRegions: async () => {
    return apiClient.get('/regions');
  },
  getCountries: async () => {
    return apiClient.get('/countries');
  },
  getOrganizationTypes: async () => {
    return apiClient.get('/organization-types');
  },
  getSavedSearches: async (userId: number) => {
    return apiClient.get(`/organizations/saved-searches/${userId}`);
  },
  saveSearch: async (userId: number, name: string, payload: any) => {
    return apiClient.post(`/organizations/saved-searches/${userId}?name=${encodeURIComponent(name)}`, payload);
  },
  deleteSavedSearch: async (id: number) => {
    return apiClient.delete(`/organizations/saved-searches/${id}`);
  },
  getSubscriptionSectors: async (orgId: string | number) => {
    return apiClient.get<string[]>(`/organizations/${orgId}/subscription-sectors`);
  },
  getMySubscriptionSectors: async () => {
    return apiClient.get<SectorDTO[]>(`/organizations/my-subscription-sectors`);
  },
  getMySubscriptionCountries: async () => {
    return apiClient.get<CountryDTO[]>(`/organizations/my-subscription-countries`);
  }
};
