import { useState, useEffect } from 'react';
import {
  Organization,
  OrganizationKPIs,
  OrganizationFilters,
  PaginatedOrganizations,
} from '@app/types/organization.dto';
import { organizationService } from "@/app/services/organizationService";

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

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<PaginatedOrganizations>(defaultOrganizations);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    loadOrganizations();
  }, [filters, sortBy, currentPage]);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      const pageSize = 10;
      const [data, allData] = await Promise.all([
        organizationService.getAllOrganizations(filters, currentPage, pageSize, sortBy),
        organizationService.getOrganizationsList(filters, sortBy),
      ]);

      // Ensure the response has the correct structure
      if (data && typeof data === 'object') {
        const validatedData: PaginatedOrganizations = {
          data: Array.isArray(data.data) ? data.data : [],
          meta: data.meta || defaultMeta,
        };
        setOrganizations(validatedData);
        setAllOrganizations(Array.isArray(allData) ? allData : []);
      } else {
        setOrganizations(defaultOrganizations);
        setAllOrganizations([]);
      }
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
