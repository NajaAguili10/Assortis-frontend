import { useState, useEffect } from 'react';
import {
  Organization,
  OrganizationKPIs,
  OrganizationFilters,
  PaginatedOrganizations,
  OrganizationTypeEnum,
  OrganizationSectorEnum,
  OrganizationStatusEnum,
  RegionEnum,
} from '@app/types/organization.dto';
import { SubSectorEnum } from '@app/types/tender.dto';
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@app/config/organization-sectors.config';
import { organizationService } from '@app/services/organizationService';

// Mock data
/*
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'World Health Organization',
    acronym: 'WHO',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.HEALTH],
    subSectors: [SubSectorEnum.PRIMARY_HEALTHCARE, SubSectorEnum.INFECTIOUS_DISEASES, SubSectorEnum.MATERNAL_HEALTH],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Switzerland',
    city: 'Geneva',
    description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
    email: 'contact@who.int',
    website: 'https://www.who.int',
    yearEstablished: 1948,
    employeeCount: 7000,
    activeProjects: 142,
    completedProjects: 856,
    partnerships: 234,
    certifications: ['ISO 9001', 'UN Verified'],
    budget: {
      amount: 2400000000,
      currency: 'USD',
      formatted: '$2.4B',
    },
    teamMembers: 7000,
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-02-20'),
  },
  // ... rest of mock organizations
];

const mockKPIs: OrganizationKPIs = {
  totalOrganizations: 2547,
  activeOrganizations: 1923,
  verifiedOrganizations: 876,
  partnerships: 456,
  newPartnerships: 18,
  countriesCovered: 127,
  invitations: 42,
  pendingInvitations: 7,
};
*/

const DEFAULT_PAGINATED: PaginatedOrganizations = {
  data: [],
  meta: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export function useOrganizations() {

  const [kpis, setKpis] = useState<OrganizationKPIs>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    verifiedOrganizations: 0,
    partnerships: 0,
    newPartnerships: 0,
    countriesCovered: 0,
    invitations: 0,
    pendingInvitations: 0,
  });
  const [filters, setFilters] = useState<OrganizationFilters>({});
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedOrganizations, setSavedOrganizations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  /** Raw list fetched from the API — used as the source for client-side filtering. */
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  /** Paginated & filtered view exposed to consumers. */
  const [organizations, setOrganizations] = useState<PaginatedOrganizations>(DEFAULT_PAGINATED);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await organizationService.getAllOrganizations();
        setAllOrganizations(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
    /*useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await organizationService.getFilters();
        setFilters(response);
      } catch (error) {
        console.error("Error fetching FILTERS:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); */



  // Fetch KPIs separately from backend
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await organizationService.getKPIs();
        setKpis(data as OrganizationKPIs);
      } catch (error) {
        console.error('Error fetching organization KPIs:', error);
      }
    };
    fetchKPIs();
  }, []);

  // Load organizations based on filters
  useEffect(() => {
    if (!isLoading) {
      loadOrganizations();
    }
  }, [filters, sortBy, currentPage, isLoading]);

  const loadOrganizations = () => {
    let filtered = [...allOrganizations];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          (org.name?.toLowerCase().includes(query) ?? false) ||
          (org.acronym?.toLowerCase().includes(query) ?? false) ||
          (org.description?.toLowerCase().includes(query) ?? false)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((org) => org.type && filters.type!.includes(org.type));
    }

    if (filters.sectors && filters.sectors.length > 0) {
      filtered = filtered.filter((org) => {
        const orgSectorCode = org.mainSector?.code;
        return orgSectorCode && filters.sectors!.includes(orgSectorCode);
      });
    }

    // SubSectors filter
    if (filters.subSectors && filters.subSectors.length > 0) {
      filtered = filtered.filter((org) => {
        const orgSubSectors: string[] = [];
        if (orgSubSectors.length === 0) {
          const parentSectors = new Set<string>();
          filters.subSectors?.forEach((subSector) => {
            Object.entries(ORGANIZATION_SECTOR_SUBSECTOR_MAP).forEach(([sector, subsectors]) => {
              if (subsectors.includes(subSector as any)) {
                parentSectors.add(sector);
              }
            });
          });
          const orgSectors = org.mainSector?.name ? [org.mainSector.name.toUpperCase()] : [];
          return orgSectors.some((sector) => parentSectors.has(sector as any));
        }
        return orgSubSectors.some((subSector) => filters.subSectors!.includes(subSector as any));
      });
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((org) => org.verificationStatus && filters.status!.includes(org.verificationStatus));
    }

    if (filters.regions && filters.regions.length > 0) {
      filtered = filtered.filter((org) => org.region && filters.regions!.includes(org.region));
    }

    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter((org) => org.country?.code && filters.countries!.includes(org.country.code));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
        case 'oldest':
          return new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    // Pagination
    const pageSize = 10;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setOrganizations({
      data: paginatedData,
      meta: {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  };

  const updateFilters = (newFilters: Partial<OrganizationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const saveOrganization = (id: string) => {
    setSavedOrganizations((prev) => new Set([...prev, id]));
  };

  const unsaveOrganization = (id: string) => {
    setSavedOrganizations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isOrganizationSaved = (id: string) => savedOrganizations.has(id);

  return {
    organizations,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    saveOrganization,
    unsaveOrganization,
    isOrganizationSaved,
    allOrganizations,
    isLoading
  };
}