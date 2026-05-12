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
} from '../types/organization.dto';

const COUNTRY_REGION_MAP: Record<string, RegionEnum> = {
  DZ: RegionEnum.AFRICA,
  AR: RegionEnum.SOUTH_AMERICA,
  AM: RegionEnum.ASIA,
  AU: RegionEnum.OCEANIA,
  AT: RegionEnum.EUROPE,
  BE: RegionEnum.EUROPE,
  BJ: RegionEnum.AFRICA,
  BO: RegionEnum.SOUTH_AMERICA,
  BA: RegionEnum.EUROPE,
  BR: RegionEnum.SOUTH_AMERICA,
  CA: RegionEnum.NORTH_AMERICA,
  TD: RegionEnum.AFRICA,
  KM: RegionEnum.AFRICA,
  CD: RegionEnum.AFRICA,
  ET: RegionEnum.AFRICA,
  FR: RegionEnum.EUROPE,
  GE: RegionEnum.ASIA,
  DE: RegionEnum.EUROPE,
  GH: RegionEnum.AFRICA,
  IN: RegionEnum.ASIA,
  KG: RegionEnum.ASIA,
  MW: RegionEnum.AFRICA,
  MU: RegionEnum.AFRICA,
  MA: RegionEnum.AFRICA,
  MM: RegionEnum.ASIA,
  NG: RegionEnum.AFRICA,
  PK: RegionEnum.ASIA,
  PS: RegionEnum.MIDDLE_EAST,
  PY: RegionEnum.SOUTH_AMERICA,
  RW: RegionEnum.AFRICA,
  SC: RegionEnum.AFRICA,
  ZA: RegionEnum.AFRICA,
  CH: RegionEnum.EUROPE,
  TG: RegionEnum.AFRICA,
  TN: RegionEnum.AFRICA,
  UA: RegionEnum.EUROPE,
  US: RegionEnum.NORTH_AMERICA,
  ZM: RegionEnum.AFRICA,
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

const normalizeSector = (sector?: string | null): OrganizationSectorEnum[] => {
  if (!sector) return [];

  const normalized = sector.toUpperCase().replace(/[\s&/-]+/g, '_');
  return Object.values(OrganizationSectorEnum).includes(normalized as OrganizationSectorEnum)
    ? [normalized as OrganizationSectorEnum]
    : [];
};

const normalizeRegion = (backendOrg: Organization): RegionEnum | undefined => {
  const backendRegion = backendOrg.region?.toUpperCase().replace(/[\s-]+/g, '_');

  if (backendRegion && Object.values(RegionEnum).includes(backendRegion as RegionEnum)) {
    return backendRegion as RegionEnum;
  }

  const countryCode = backendOrg.country?.code?.toUpperCase();
  return countryCode ? COUNTRY_REGION_MAP[countryCode] : undefined;
};

const normalizeOrganization = (org: Organization): Organization => {
  const budgetAmount = typeof org.annualTurnover === 'number' ? org.annualTurnover : undefined;
  const sectors = normalizeSector(org.mainSector);

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
    city: org.city ? { id: org.city.id, name: org.city.name } : { id: 0, name: '' },
    country: org.country ? { id: org.country.id, name: org.country.name, code: org.country.code } : { id: 0, name: '', code: '' },
    region: normalizeRegion(org),
    mainSector: org.mainSector,
    sectors: Array.isArray(org.sectors) 
      ? org.sectors.map((s: any) => typeof s === 'string' ? { id: 0, name: s, code: s } : s)
      : (org.mainSector ? [org.mainSector] : []),
    subSectors: org.subsectors || [],
    activeProjects: org.activeProjects || 0,
    completedProjects: 0,
    partnerships: 0,
    employeeCount: org.employeesCount ?? undefined,
    yearEstablished: org.yearFounded ?? undefined,
    teamMembers: org.employeesCount ?? undefined,
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
      (org.sectors || []).some((sector) => sector.toLowerCase().includes(query)),
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
      filtered = filtered.filter((org) => (org.budget?.amount || 0) >= budget);
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
      (org.sectors || []).some((sector) => sector.toLowerCase().includes(query)),
    );
  }

  if (filters?.status?.length) {
    filtered = filtered.filter((org) => filters.status!.includes((org.status || org.verificationStatus) as any));
  }

  if (filters?.sectors?.length) {
    filtered = filtered.filter((org) =>
      (org.sectors || []).some((orgSector) => 
        filters.sectors!.some(s => s.code === (orgSector.code || orgSector))
      ),
    );
  }

  if (filters?.subSectors?.length) {
    filtered = filtered.filter((org) =>
      (org.subSectors || []).some((orgSub) => 
        filters.subSectors!.some(s => s.code === orgSub.code)
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
      const orgCountryCode = org.country?.code;
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
    : normalizeSector(org.mainSector),
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
