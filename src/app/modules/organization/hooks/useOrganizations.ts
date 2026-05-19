import { useState, useEffect } from 'react';
import {
  Organization,
  OrganizationKPIs,
  OrganizationFilters,
  PaginatedOrganizations,
} from '@app/types/organization.dto';
import { organizationService } from "@/app/services/organizationService";
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@/app/config/organization-sectors.config';

const defaultMeta = {
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalItems: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const defaultOrganizations: PaginatedOrganizations = {
  data: [],
  meta: defaultMeta,
};

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

const matchesTeamSize = (count: number | undefined, selectedSizes: string[]) => {
  if (count == null) return false;

  return selectedSizes.some((size) => {
    switch (size) {
      case 'MICRO':
        return count < 10;
      case 'SMALL':
        return count >= 10 && count <= 50;
      case 'MEDIUM':
        return count > 50 && count <= 200;
      case 'LARGE':
        return count > 200;
      default:
        return false;
    }
  });
};

const getCode = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'object') {
    const code = (value as { code?: string; name?: string }).code || (value as { code?: string; name?: string }).name;
    return code?.toUpperCase().replace(/[\s-]+/g, '_');
  }
  return undefined;
};

const getStatusValue = (org: Organization): string | undefined => {
  if (org.status) return org.status.toUpperCase();
  if (org.verificationStatus) return org.verificationStatus.toUpperCase();
  return undefined;
};

export function useOrganizations(options?: { scope?: 'all' | 'database' }) {

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
        const response = options?.scope === 'database'
          ? await organizationService.getOrganizationsDatabaseList()
          : await organizationService.getOrganizationsList();
        setAllOrganizations(response);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [options?.scope]);
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
  }, [allOrganizations, filters, sortBy, currentPage, isLoading]);

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
      filtered = filtered.filter((org) =>
        (org.sectors || []).some((sector) =>
          filters.sectors!.some((filterSector) => getCode(filterSector) === getCode(sector))
        )
      );
    }

    if (filters.subSectors && filters.subSectors.length > 0) {
      filtered = filtered.filter((org) => {
        if (org.subSectors && org.subSectors.length > 0) {
          return org.subSectors.some((subsector) =>
            filters.subSectors!.some((filterSubsector) => getCode(filterSubsector) === getCode(subsector))
          );
        }

        const parentSectors = new Set<string>();
        filters.subSectors.forEach((subDTO) => {
          Object.entries(ORGANIZATION_SECTOR_SUBSECTOR_MAP).forEach(([sector, subsectors]) => {
            if (subsectors.includes(subDTO.code as any)) {
              parentSectors.add(sector);
            }
          });
        });

        return (org.sectors || []).some((sector) => parentSectors.has(sector.code));
      });
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((org) => {
        const verificationStatus = org.verificationStatus?.toUpperCase();
        const status = getStatusValue(org);

        return filters.status!.some((filterStatus) => {
          const normalizedFilter = filterStatus.toUpperCase();

          if (normalizedFilter === 'ACTIVE') {
            return status === 'ACTIVE';
          }

          return normalizedFilter === status || normalizedFilter === verificationStatus;
        });
      });
    }

    if (filters.teamSize && filters.teamSize.length > 0) {
      filtered = filtered.filter((org) => {
        const size = org.employeeCount ?? org.teamMembers;
        return matchesTeamSize(size, filters.teamSize!);
      });
    }

    if (filters.regions && filters.regions.length > 0) {
      filtered = filtered.filter((org) => org.region && filters.regions!.includes(org.region));
    }

    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter((org) => {
        const countryCode = getCode(org.country);
        return countryCode && filters.countries!.some((country) => country.code === countryCode);
      });
    }

    try {
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt ?? '').getTime() - new Date(a.createdAt ?? '').getTime();
          case 'oldest':
            return new Date(a.createdAt ?? '').getTime() - new Date(b.createdAt ?? '').getTime();
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          default:
            return 0;
        }
      });

      // Pagination
      const pageSize = defaultMeta.pageSize;
      const startIdx = (currentPage - 1) * pageSize;
      const pagedData = filtered.slice(startIdx, startIdx + pageSize);
      const totalPages = Math.ceil(filtered.length / pageSize);
      setOrganizations({
        data: pagedData,
        meta: {
          currentPage,
          pageSize,
          totalPages,
          totalItems: filtered.length,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations(defaultOrganizations);
      setAllOrganizations([]);
    } finally {
      setIsLoading(false);
    }
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
    allOrganizations,
    isLoading,
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
  };
}
