import { useState, useMemo, useCallback } from 'react';
import { 
  ToRListDTO, 
  ToRStatusEnum, 
  ToRTypeEnum,
  SectorEnum, 
  SubSectorEnum,
  SECTOR_SUBSECTOR_MAP,
  CountryEnum,
  CurrencyEnum,
  FundingAgencyEnum,
  RegionEnum,
  REGION_COUNTRY_MAP
} from '../types/tender.dto';

// GLOBAL CACHE: Ensure ToRs are generated ONCE and shared across all instances
let globalToRsCache: ToRListDTO[] | null = null;

// Mock data generator for ToRs
const generateMockToRs = (count: number): ToRListDTO[] => {
  // Return cached data if available
  if (globalToRsCache !== null) {
    console.log('📦 Using cached ToRs data');
    return globalToRsCache;
  }

  console.log('🔄 Generating fresh ToRs data');
  const statuses = [ToRStatusEnum.OPEN, ToRStatusEnum.OPEN, ToRStatusEnum.OPEN, ToRStatusEnum.CLOSED, ToRStatusEnum.AWARDED];
  const types = [ToRTypeEnum.CONSULTANT, ToRTypeEnum.SPECIALIST, ToRTypeEnum.PROJECT_MANAGER, ToRTypeEnum.TECHNICAL_EXPERT];
  const countries = [CountryEnum.FR, CountryEnum.KE, CountryEnum.TZ, CountryEnum.SN, CountryEnum.MA];
  const regions = [RegionEnum.WESTERN_EUROPE, RegionEnum.EAST_AFRICA, RegionEnum.WEST_AFRICA, RegionEnum.NORTH_AFRICA];
  const sectors = [SectorEnum.EDUCATION, SectorEnum.HEALTH, SectorEnum.AGRICULTURE, SectorEnum.INFRASTRUCTURE, SectorEnum.WATER_SANITATION, SectorEnum.GOVERNANCE];
  const fundingAgencies = [FundingAgencyEnum.WB, FundingAgencyEnum.UNDP, FundingAgencyEnum.AFDB, FundingAgencyEnum.USAID, FundingAgencyEnum.AFD, FundingAgencyEnum.EC];
  const currencies = [CurrencyEnum.USD, CurrencyEnum.EUR, CurrencyEnum.USD, CurrencyEnum.EUR]; // Mix of USD and EUR
  
  const tors = Array.from({ length: count }, (_, i) => {
    const amount = Math.floor(Math.random() * 150000) + 50000;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 90) + 1);
    const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    const referenceNumber = `TOR-2026-${String(i + 1).padStart(4, '0')}`;
    
    // Select sector and get corresponding subsectors
    const selectedSector = sectors[i % sectors.length];
    const availableSubSectors = SECTOR_SUBSECTOR_MAP[selectedSector] || [];
    
    // Select currency from mix (60% USD, 40% EUR)
    const selectedCurrency = currencies[i % currencies.length];
    const currencySymbol = selectedCurrency === CurrencyEnum.USD ? '$' : '€';
    
    const titles = [
      'Senior Water Resources Management Consultant',
      'Governance and Anti-Corruption Specialist',
      'Infrastructure Development Project Manager',
      'Healthcare Systems Strengthening Expert',
      'Agricultural Value Chain Specialist',
      'Education Program Coordinator',
      'Climate Change Adaptation Consultant',
      'Gender Equality and Social Inclusion Expert',
      'Monitoring and Evaluation Specialist',
      'Financial Management Consultant'
    ];
    
    const organizationNames = [
      'World Bank',
      'UNDP',
      'African Development Bank',
      'USAID',
      'AFD',
      'European Commission'
    ];
    
    return {
      id: `tor-${i + 1}`,
      referenceNumber,
      title: titles[i % titles.length],
      tenderId: `tender-${Math.floor(i / 2) + 1}`, // Link to parent tender
      tenderTitle: `${selectedSector} Development Project ${Math.floor(i / 2) + 1}`,
      tenderReference: `TND-2026-${String(Math.floor(i / 2) + 1).padStart(4, '0')}`,
      organizationName: organizationNames[i % organizationNames.length],
      description: `Seeking experienced professional for ${titles[i % titles.length]} position. The consultant will provide technical assistance and strategic guidance.`,
      country: countries[i % countries.length],
      region: regions[i % regions.length],
      deadline,
      daysRemaining,
      budget: {
        amount,
        currency: selectedCurrency,
        formatted: `${currencySymbol}${amount.toLocaleString()}`
      },
      status: statuses[i % statuses.length],
      type: types[i % types.length],
      sectors: [selectedSector],
      subsectors: availableSubSectors.length > 0 ? [availableSubSectors[0]] : [],
      fundingAgency: fundingAgencies[i % fundingAgencies.length],
      experienceYears: Math.floor(Math.random() * 10) + 5,
      duration: `${Math.floor(Math.random() * 18) + 6} months`,
      inPipeline: false,
      createdAt: createdDate,
      matchScore: Math.floor(Math.random() * 30) + 70,
    };
  });

  // Cache the generated ToRs
  globalToRsCache = tors;
  return tors;
};

export interface ToRFilters {
  status?: ToRStatusEnum[];
  type?: ToRTypeEnum[];
  sectors?: SectorEnum[];
  subSectors?: SubSectorEnum[];
  countries?: CountryEnum[];
  regions?: RegionEnum[];
  fundingAgencies?: FundingAgencyEnum[];
  searchQuery?: string;
  minBudget?: number;
  maxBudget?: number;
  minExperience?: number;
}

export type ToRSortField = 'newest' | 'oldest' | 'deadline' | 'budgetHigh' | 'budgetLow' | 'matchScore';

export function useToRs() {
  const [allToRs] = useState<ToRListDTO[]>(() => generateMockToRs(100)); // Increased from 30 to 100 to cover all tenders
  const [filters, setFilters] = useState<ToRFilters>({});
  const [sortBy, setSortBy] = useState<ToRSortField>('newest');

  // Get ToR by ID - useCallback BEFORE useMemo to maintain hook order
  const getToRById = useCallback((id: string): ToRListDTO | undefined => {
    return allToRs.find(tor => tor.id === id);
  }, [allToRs]);

  // Filter ToRs
  const filteredToRs = useMemo(() => {
    return allToRs.filter(tor => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(tor.status)) return false;
      }

      // Type filter
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(tor.type)) return false;
      }

      // Sectors filter
      if (filters.sectors && filters.sectors.length > 0) {
        if (!tor.sectors.some(s => filters.sectors?.includes(s))) return false;
      }

      // SubSectors filter
      if (filters.subSectors && filters.subSectors.length > 0) {
        if (!tor.subsectors?.some(s => filters.subSectors?.includes(s))) return false;
      }

      // Countries filter
      if (filters.countries && filters.countries.length > 0) {
        if (!filters.countries.includes(tor.country)) return false;
      }

      // Regions filter
      if (filters.regions && filters.regions.length > 0) {
        const regionCountries = filters.regions.flatMap(region => {
          return REGION_COUNTRY_MAP[region] || [];
        });
        if (!regionCountries.includes(tor.country)) return false;
      }

      // Funding Agencies filter
      if (filters.fundingAgencies && filters.fundingAgencies.length > 0) {
        if (!filters.fundingAgencies.includes(tor.fundingAgency)) return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = tor.title.toLowerCase().includes(query);
        const matchesReference = tor.referenceNumber.toLowerCase().includes(query);
        const matchesTenderTitle = tor.tenderTitle?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesReference && !matchesTenderTitle) return false;
      }

      // Budget range
      if (filters.minBudget && tor.budget.amount < filters.minBudget) return false;
      if (filters.maxBudget && tor.budget.amount > filters.maxBudget) return false;

      // Experience filter
      if (filters.minExperience && (tor.experienceYears || 0) < filters.minExperience) return false;

      return true;
    });
  }, [allToRs, filters]);

  // Sort ToRs
  const sortedToRs = useMemo(() => {
    const sorted = [...filteredToRs];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'deadline':
        return sorted.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
      case 'budgetHigh':
        return sorted.sort((a, b) => b.budget.amount - a.budget.amount);
      case 'budgetLow':
        return sorted.sort((a, b) => a.budget.amount - b.budget.amount);
      case 'matchScore':
        return sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      default:
        return sorted;
    }
  }, [filteredToRs, sortBy]);

  const updateFilters = (newFilters: Partial<ToRFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.type && filters.type.length > 0) count++;
    if (filters.sectors && filters.sectors.length > 0) count++;
    if (filters.subSectors && filters.subSectors.length > 0) count++;
    if (filters.countries && filters.countries.length > 0) count++;
    if (filters.regions && filters.regions.length > 0) count++;
    if (filters.fundingAgencies && filters.fundingAgencies.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.minBudget || filters.maxBudget) count++;
    if (filters.minExperience) count++;
    return count;
  }, [filters]);

  return {
    // Data
    allToRs,
    filteredToRs: sortedToRs,
    getToRById,
    
    // Filters & Sort
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
  };
}