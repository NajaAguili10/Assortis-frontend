import { useState, useMemo } from 'react';
import { 
  TenderListDTO, 
  TenderStatusEnum, 
  SectorEnum, 
  SubSectorEnum,
  SECTOR_SUBSECTOR_MAP,
  CountryEnum,
  CurrencyEnum,
  MoneyDTO,
  TenderKPIsDTO,
  PaginatedResponseDTO,
  FundingAgencyEnum,
  ProcurementTypeEnum,
  NoticeTypeEnum,
  MatchingAlertCategoryEnum,
  RegionEnum,
  REGION_COUNTRY_MAP
} from '../types/tender.dto';

// Generate a simple PDF blob for demo purposes
const generateDemoPDF = (fileName: string, tenderRef: string): string => {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 120
>>
stream
BT
/F1 24 Tf
50 700 Td
(${fileName}) Tj
0 -30 Td
/F1 12 Tf
(Reference: ${tenderRef}) Tj
0 -20 Td
(This is a demo document for Assortis platform) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
487
%%EOF`;
  
  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

// GLOBAL CACHE: Ensure tenders are generated ONCE and shared across all instances
let globalTendersCache: TenderListDTO[] | null = null;

// Mock data generator
const generateMockTenders = (count: number): TenderListDTO[] => {
  // Return cached data if available
  if (globalTendersCache !== null) {
    console.log('📦 Using cached tenders data');
    return globalTendersCache;
  }

  console.log('🔄 Generating fresh tenders data');
  const statuses = [TenderStatusEnum.PUBLISHED, TenderStatusEnum.PUBLISHED, TenderStatusEnum.PUBLISHED, TenderStatusEnum.CLOSED, TenderStatusEnum.AWARDED];
  const countries = [CountryEnum.FR, CountryEnum.KE, CountryEnum.TZ, CountryEnum.SN, CountryEnum.MA];
  const regions = [RegionEnum.WESTERN_EUROPE, RegionEnum.EAST_AFRICA, RegionEnum.WEST_AFRICA, RegionEnum.NORTH_AFRICA];
  const sectors = [SectorEnum.EDUCATION, SectorEnum.HEALTH, SectorEnum.AGRICULTURE, SectorEnum.INFRASTRUCTURE];
  const donors = ['European Commission', 'World Bank', 'African Development Bank', 'UN Development Programme'];
  const fundingAgencies = [FundingAgencyEnum.EC, FundingAgencyEnum.WB, FundingAgencyEnum.AFDB, FundingAgencyEnum.UNDP, FundingAgencyEnum.USAID, FundingAgencyEnum.AFD];
  const procurementTypes = [ProcurementTypeEnum.SERVICES, ProcurementTypeEnum.EQUIPMENT, ProcurementTypeEnum.WORKS, ProcurementTypeEnum.GRANTS];
  const noticeTypes = [NoticeTypeEnum.EARLY_INTELLIGENCE, NoticeTypeEnum.FORECAST_PRIOR_NOTICE, NoticeTypeEnum.PROJECT_NOTICE];
  const currencies = [CurrencyEnum.USD, CurrencyEnum.EUR, CurrencyEnum.USD, CurrencyEnum.EUR, CurrencyEnum.EUR]; // Mix of USD and EUR
  
  const tenders = Array.from({ length: count }, (_, i) => {
    const amount = Math.floor(Math.random() * 5000000) + 100000;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 90) + 1);
    const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const proposalsCount = Math.floor(Math.random() * 25) + 1;
    const interestedOrgsCount = Math.floor(Math.random() * 50) + proposalsCount;
    const publishedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    
    const referenceNumber = `TND-2026-${String(i + 1).padStart(4, '0')}`;
    
    // Select sector and get corresponding subsectors
    const selectedSector = sectors[i % sectors.length];
    const availableSubSectors = SECTOR_SUBSECTOR_MAP[selectedSector] || [];
    const selectedSubSector = availableSubSectors[i % availableSubSectors.length];
    
    // Select currency from mix (60% EUR, 40% USD)
    const selectedCurrency = currencies[i % currencies.length];
    const currencySymbol = selectedCurrency === CurrencyEnum.USD ? '$' : '€';
    const isMultiCountry = i % 4 === 0;
    const countriesForTender = isMultiCountry
      ? [countries[i % countries.length], countries[(i + 1) % countries.length]]
      : [countries[i % countries.length]];
    const categoryCycle = [
      MatchingAlertCategoryEnum.PROJECTS,
      MatchingAlertCategoryEnum.PROJECTS,
      MatchingAlertCategoryEnum.PROJECTS,
      MatchingAlertCategoryEnum.AWARDS,
      MatchingAlertCategoryEnum.SHORTLISTS,
    ];
    const alertCategory = categoryCycle[i % categoryCycle.length];
    
    return {
      id: `tender-${i + 1}`,
      referenceNumber,
      title: `${selectedSector} Development Project ${i + 1}`,
      organizationName: donors[i % donors.length],
      country: countries[i % countries.length],
      countries: countriesForTender,
      isMultiCountry,
      deadline,
      daysRemaining,
      budget: {
        amount,
        currency: selectedCurrency,
        formatted: `${currencySymbol}${amount.toLocaleString()}`
      },
      status: statuses[i % statuses.length],
      matchScore: Math.floor(Math.random() * 30) + 70,
      sectors: [selectedSector],
      subsectors: selectedSubSector ? [selectedSubSector] : [], // Fixed field name to match DTO
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      proposalsCount,
      interestedOrgsCount,
      description: `Comprehensive ${selectedSector.toLowerCase()} development initiative focused on sustainable growth and community empowerment. This project aims to deliver measurable impact across multiple beneficiary communities.`,
      publishedDate,
      eligibility: ['NGOs', 'International Organizations', 'Registered Non-Profits', 'Academic Institutions'],
      documents: [
        { 
          name: 'Terms of Reference', 
          type: 'PDF',
          url: generateDemoPDF('Terms of Reference', referenceNumber)
        },
        { 
          name: 'Application Form', 
          type: 'DOCX',
          url: generateDemoPDF('Application Form', referenceNumber)
        },
        { 
          name: 'Budget Template', 
          type: 'XLSX',
          url: generateDemoPDF('Budget Template', referenceNumber)
        },
      ],
      contactEmail: `procurement@${donors[i % donors.length].toLowerCase().replace(/ /g, '')}.org`,
      fundingAgency: fundingAgencies[i % fundingAgencies.length],
      procurementType: procurementTypes[i % procurementTypes.length],
      noticeType: noticeTypes[i % noticeTypes.length],
      region: regions[i % regions.length],
      alertCategory,
      mostRelevantPartnersCount: Math.floor(Math.random() * 6) + 1,
      otherPossiblePartnersCount: Math.floor(Math.random() * 8) + 2,
      awardCompanies: alertCategory === MatchingAlertCategoryEnum.AWARDS
        ? [
            {
              name: `Awarded Company ${i + 1}`,
              budget: {
                amount: Math.floor(amount * 0.6),
                currency: selectedCurrency,
                formatted: `${currencySymbol}${Math.floor(amount * 0.6).toLocaleString()}`
              },
              date: new Date(publishedDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            },
            {
              name: `Joint Venture ${i + 2}`,
              budget: {
                amount: Math.floor(amount * 0.4),
                currency: selectedCurrency,
                formatted: `${currencySymbol}${Math.floor(amount * 0.4).toLocaleString()}`
              },
              date: new Date(publishedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            },
          ]
        : undefined,
      shortlistCompanies: alertCategory === MatchingAlertCategoryEnum.SHORTLISTS
        ? [
            {
              name: `Shortlisted Partner ${i + 1}`,
              date: new Date(publishedDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            },
            {
              name: `Consortium Candidate ${i + 3}`,
              date: new Date(publishedDate.getTime() + 4 * 24 * 60 * 60 * 1000),
            },
          ]
        : undefined,
      torId: `tor-${(i * 2) + 1}` // Link to associated ToR for all tenders
    };
  });

  // Cache the generated tenders
  globalTendersCache = tenders;
  return tenders;
};

export interface TenderFilters {
  status?: TenderStatusEnum[];
  sectors?: SectorEnum[];
  subSectors?: SubSectorEnum[];
  countries?: CountryEnum[];
  regions?: RegionEnum[];
  fundingAgencies?: FundingAgencyEnum[];
  procurementTypes?: ProcurementTypeEnum[];
  noticeTypes?: NoticeTypeEnum[];
  searchQuery?: string;
  searchMode?: 'allWords' | 'anyWords' | 'exactPhrase' | 'boolean';
  minBudget?: number;
  maxBudget?: number;
  budgetDirection?: 'any' | 'above' | 'below';
  publishedFrom?: Date;
  publishedTo?: Date;
  hideMultiCountry?: boolean;
  alertCategory?: MatchingAlertCategoryEnum;
}

export type SortField = 'newest' | 'oldest' | 'deadline' | 'budgetHigh' | 'budgetLow' | 'matchScore';

export function useTenders() {
  const [allTenders] = useState<TenderListDTO[]>(() => generateMockTenders(50));
  const [filters, setFilters] = useState<TenderFilters>({});
  const [sortBy, setSortBy] = useState<SortField>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [savedTenderIds, setSavedTenderIds] = useState<Set<string>>(new Set());

  // Filter tenders
  const filteredTenders = useMemo(() => {
    return allTenders.filter(tender => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(tender.status)) return false;
      }

      // Sectors filter
      if (filters.sectors && filters.sectors.length > 0) {
        if (!tender.sectors.some(s => filters.sectors?.includes(s))) return false;
      }

      // SubSectors filter
      if (filters.subSectors && filters.subSectors.length > 0) {
        if (!tender.subsectors?.some(s => filters.subSectors?.includes(s))) return false;
      }

      // Countries filter
      if (filters.countries && filters.countries.length > 0) {
        if (!filters.countries.includes(tender.country)) return false;
      }

      // Regions filter
      if (filters.regions && filters.regions.length > 0) {
        // Assuming a region is associated with a country, this is a placeholder
        const regionCountries = filters.regions.flatMap(region => {
          // This should be a map of regions to countries
          return REGION_COUNTRY_MAP[region] || [];
        });
        if (!regionCountries.includes(tender.country)) return false;
      }

      // Funding Agencies filter
      if (filters.fundingAgencies && filters.fundingAgencies.length > 0) {
        if (!filters.fundingAgencies.includes(tender.fundingAgency)) return false;
      }

      // Procurement Types filter
      if (filters.procurementTypes && filters.procurementTypes.length > 0) {
        if (!filters.procurementTypes.includes(tender.procurementType)) return false;
      }

      // Notice Types filter
      if (filters.noticeTypes && filters.noticeTypes.length > 0) {
        if (!filters.noticeTypes.includes(tender.noticeType)) return false;
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const haystack = `${tender.title} ${tender.referenceNumber} ${tender.organizationName}`.toLowerCase();

        if (filters.searchMode === 'exactPhrase') {
          if (!haystack.includes(query)) return false;
        } else if (filters.searchMode === 'anyWords') {
          const words = query.split(/\s+/).filter(Boolean);
          if (!words.some(word => haystack.includes(word))) return false;
        } else if (filters.searchMode === 'boolean') {
          if (query.includes(' and ')) {
            const words = query.split(' and ').map(word => word.trim()).filter(Boolean);
            if (!words.every(word => haystack.includes(word))) return false;
          } else if (query.includes(' or ')) {
            const words = query.split(' or ').map(word => word.trim()).filter(Boolean);
            if (!words.some(word => haystack.includes(word))) return false;
          } else {
            if (!haystack.includes(query)) return false;
          }
        } else {
          const words = query.split(/\s+/).filter(Boolean);
          if (!words.every(word => haystack.includes(word))) return false;
        }
      }

      // Budget range
      if (filters.budgetDirection === 'above' && filters.minBudget && tender.budget.amount < filters.minBudget) return false;
      if (filters.budgetDirection === 'below' && filters.maxBudget && tender.budget.amount > filters.maxBudget) return false;
      if (!filters.budgetDirection || filters.budgetDirection === 'any') {
        if (filters.minBudget && tender.budget.amount < filters.minBudget) return false;
        if (filters.maxBudget && tender.budget.amount > filters.maxBudget) return false;
      }

      // Published date range
      if (filters.publishedFrom && tender.publishedDate < filters.publishedFrom) return false;
      if (filters.publishedTo && tender.publishedDate > filters.publishedTo) return false;

      // Hide multi-country projects
      if (filters.hideMultiCountry && tender.isMultiCountry) return false;

      // Alert category filter
      if (filters.alertCategory && tender.alertCategory !== filters.alertCategory) return false;

      return true;
    });
  }, [allTenders, filters]);

  // Sort tenders
  const sortedTenders = useMemo(() => {
    const sorted = [...filteredTenders];
    
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
  }, [filteredTenders, sortBy]);

  // Paginate tenders
  const paginatedTenders: PaginatedResponseDTO<TenderListDTO> = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = sortedTenders.slice(startIndex, endIndex);
    
    const totalPages = Math.ceil(sortedTenders.length / pageSize);
    
    return {
      data,
      meta: {
        page: currentPage,
        pageSize,
        totalItems: sortedTenders.length,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      }
    };
  }, [sortedTenders, currentPage, pageSize]);

  // Calculate KPIs
  const kpis: TenderKPIsDTO = useMemo(() => {
    const activeTenders = allTenders.filter(t => t.status === TenderStatusEnum.PUBLISHED).length;
    const closedTenders = allTenders.filter(t => t.status === TenderStatusEnum.CLOSED).length;
    const awardedTenders = allTenders.filter(t => t.status === TenderStatusEnum.AWARDED).length;
    
    const totalBudget = allTenders.reduce((sum, t) => sum + t.budget.amount, 0);
    const avgBudget = totalBudget / allTenders.length;
    
    const successRate = allTenders.length > 0 ? (awardedTenders / allTenders.length) * 100 : 0;
    
    // Mock user-specific data
    const mySubmissions = 8;
    const myPendingSubmissions = 3;
    const myInvitations = 5;
    const pipelineValue = 4500000;

    return {
      totalTenders: allTenders.length,
      activeTenders,
      closedTenders,
      awardedTenders,
      averageBudget: {
        amount: avgBudget,
        currency: CurrencyEnum.EUR,
        formatted: `€${Math.round(avgBudget).toLocaleString()}`
      },
      averageProposalsPerTender: 12,
      successRate,
      mySubmissions,
      myPendingSubmissions,
      myInvitations,
      pipelineValue: {
        amount: pipelineValue,
        currency: CurrencyEnum.EUR,
        formatted: `€${(pipelineValue / 1000000).toFixed(1)}M`
      }
    };
  }, [allTenders]);

  // Actions
  const saveTender = (tenderId: string) => {
    setSavedTenderIds(prev => new Set(prev).add(tenderId));
  };

  const unsaveTender = (tenderId: string) => {
    setSavedTenderIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(tenderId);
      return newSet;
    });
  };

  const isTenderSaved = (tenderId: string) => {
    return savedTenderIds.has(tenderId);
  };

  const updateFilters = (newFilters: Partial<TenderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.sectors && filters.sectors.length > 0) count++;
    if (filters.subSectors && filters.subSectors.length > 0) count++;
    if (filters.countries && filters.countries.length > 0) count++;
    if (filters.regions && filters.regions.length > 0) count++;
    if (filters.fundingAgencies && filters.fundingAgencies.length > 0) count++;
    if (filters.procurementTypes && filters.procurementTypes.length > 0) count++;
    if (filters.noticeTypes && filters.noticeTypes.length > 0) count++;
    if (filters.searchQuery) count++;
    if (filters.searchMode) count++;
    if (filters.minBudget || filters.maxBudget) count++;
    if (filters.budgetDirection && filters.budgetDirection !== 'any') count++;
    if (filters.publishedFrom || filters.publishedTo) count++;
    if (filters.hideMultiCountry) count++;
    if (filters.alertCategory) count++;
    return count;
  }, [filters]);

  return {
    // Data
    tenders: paginatedTenders,
    kpis,
    
    // Filters & Sort
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    
    // Pagination
    currentPage,
    setCurrentPage,
    
    // Actions
    saveTender,
    unsaveTender,
    isTenderSaved,
    
    // Access to all tenders (unfiltered, unpaginated) for detail pages
    allTenders,
  };
}