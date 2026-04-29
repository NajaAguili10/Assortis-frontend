import { apiClient } from '../api/apiClient';
import {
  OrganizationFilters,
  PaginatedOrganizations,
  Organization,
  OrganizationBackend,
  OrganizationSectorEnum,
  RegionEnum,
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

  return normalized;
};

const normalizeSector = (sector?: string | null): OrganizationSectorEnum[] => {
  if (!sector) return [];

  const normalized = sector.toUpperCase().replace(/[\s&/-]+/g, '_');
  return Object.values(OrganizationSectorEnum).includes(normalized as OrganizationSectorEnum)
    ? [normalized as OrganizationSectorEnum]
    : [];
};

const normalizeRegion = (backendOrg: OrganizationBackend): RegionEnum | undefined => {
  const backendRegion = backendOrg.region?.toUpperCase().replace(/[\s-]+/g, '_');

  if (backendRegion && Object.values(RegionEnum).includes(backendRegion as RegionEnum)) {
    return backendRegion as RegionEnum;
  }

  const countryCode = backendOrg.country?.code?.toUpperCase();
  return countryCode ? COUNTRY_REGION_MAP[countryCode] : undefined;
};

const normalizeOrganization = (org: OrganizationBackend): Organization => {
  const budgetAmount = typeof org.annualTurnover === 'number' ? org.annualTurnover : undefined;
  const sectors = normalizeSector(org.mainSector);

  return {
    id: org.id.toString(),
    name: org.name,
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
    city: org.city?.name || '',
    country: org.country?.name || '',
    region: normalizeRegion(org),
    sectors,
    subSectors: [],
    activeProjects: 0,
    completedProjects: 0,
    partnerships: 0,
    employeeCount: org.employeesCount ?? undefined,
    yearEstablished: org.yearFounded ?? undefined,
    teamMembers: org.employeesCount ?? undefined,
    budget: budgetAmount !== undefined
      ? {
          amount: budgetAmount,
          currency: 'EUR',
          formatted: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
          }).format(budgetAmount),
        }
      : undefined,
    certifications: [],
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
      org.name.toLowerCase().includes(query) ||
      org.acronym?.toLowerCase().includes(query) ||
      org.description?.toLowerCase().includes(query),
    );
  }

  if (filters?.type?.length) {
    filtered = filtered.filter((org) => filters.type!.includes(org.type as any));
  }

  if (filters?.status?.length) {
    filtered = filtered.filter((org) => filters.status!.includes((org.status || org.verificationStatus) as any));
  }

  if (filters?.sectors?.length) {
    filtered = filtered.filter((org) =>
      (org.sectors || []).some((sector) => filters.sectors!.includes(sector as OrganizationSectorEnum)),
    );
  }

  const regionFilters = filters?.regions || filters?.region;
  if (regionFilters?.length) {
    filtered = filtered.filter((org) => org.region && regionFilters.includes(org.region as RegionEnum));
  }

  const countryFilters = filters?.countries || filters?.country;
  if (countryFilters?.length) {
    filtered = filtered.filter((org) => {
      const country = typeof org.country === 'string' ? org.country : org.country?.name;
      return country ? countryFilters.includes(country) : false;
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

  getAllOrganizations: async (
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
};
