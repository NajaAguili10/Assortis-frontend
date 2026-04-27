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

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<PaginatedOrganizations>({
    data: [],
    meta: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const [backendOrganizations, setBackendOrganizations] = useState<Organization[]>([]);
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

  // Simple getAll useEffect
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await organizationService.getAllOrganizations();
        // Normalize backend data to match frontend Organization interface if needed
        const normalized: Organization[] = (data as any[]).map(org => ({
          ...org,
          id: String(org.id),
          email: org.contactEmail || org.email || '',
          phone: org.contactPhone || org.phone || '',
          employeeCount: org.employeesCount || org.employeeCount || 0,
          yearEstablished: org.yearFounded || org.yearEstablished || 0,
          sectors: org.sectors || (org.mainSector ? [org.mainSector.code] : []),
          createdAt: org.createdAt ? new Date(org.createdAt) : new Date(),
          updatedAt: org.updatedAt ? new Date(org.updatedAt) : new Date(),
          activeProjects: org.activeProjects || 0,
          completedProjects: org.completedProjects || 0,
          partnerships: org.partnerships || 0,
          teamMembers: org.teamMembers || 0,
          certifications: org.certifications || [],
          status: org.status || (org.isActive ? OrganizationStatusEnum.ACTIVE : OrganizationStatusEnum.INACTIVE),
          country: org.country?.name || (typeof org.country === 'string' ? org.country : ''),
          city: org.city?.name || (typeof org.city === 'string' ? org.city : ''),
          region: org.region || RegionEnum.AFRICA,
          type: org.type
        }));
        setBackendOrganizations(normalized);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

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
  }, [filters, sortBy, currentPage, backendOrganizations, isLoading]);

  const loadOrganizations = () => {
    let filtered = [...backendOrganizations];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.acronym?.toLowerCase().includes(query) ||
          org.description.toLowerCase().includes(query)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((org) => filters.type!.includes(org.type));
    }

    if (filters.sectors && filters.sectors.length > 0) {
      filtered = filtered.filter((org) =>
        org.sectors.some((sector) => filters.sectors!.includes(sector as any))
      );
    }

    // SubSectors filter
    if (filters.subSectors && filters.subSectors.length > 0) {
      filtered = filtered.filter((org) => {
        if (!org.subSectors || org.subSectors.length === 0) {
          const parentSectors = new Set<string>();
          filters.subSectors!.forEach((subSector) => {
            Object.entries(ORGANIZATION_SECTOR_SUBSECTOR_MAP).forEach(([sector, subsectors]) => {
              if (subsectors.includes(subSector)) {
                parentSectors.add(sector);
              }
            });
          });
          return org.sectors.some((sector) => parentSectors.has(sector as any));
        }
        return org.subSectors.some((subSector) => filters.subSectors!.includes(subSector));
      });
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((org) => filters.status!.includes(org.status));
    }

    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter((org) => filters.region!.includes(org.region));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'partnerships':
          return b.partnerships - a.partnerships;
        case 'projects':
          return b.activeProjects - a.activeProjects;
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
    allOrganizations: backendOrganizations,
    isLoading
  };
}