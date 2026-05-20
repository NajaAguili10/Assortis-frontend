import { useState, useMemo, useEffect, useCallback } from 'react';
import { tenderService } from '../services/tenderService';
import { organizationService } from '../services/organizationService';
import { useAuth } from '../contexts/AuthContext';
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

function parseDate(value: Date | string | number | null | undefined): Date | undefined {
  if (value instanceof Date) return value;
  if (value === null || value === undefined || value === '') return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function normalizeTenderData(tender: any): TenderListDTO {
  return {
    ...tender,
    deadline: parseDate(tender.deadline) ?? new Date(),
    createdAt: parseDate(tender.createdAt) ?? new Date(),
    publishedDate: parseDate(tender.publishedDate),
    awardCompanies: tender.awardCompanies?.map((award: any) => ({
      ...award,
      date: parseDate(award.date) ?? new Date(),
    })),
    shortlistCompanies: tender.shortlistCompanies?.map((shortlist: any) => ({
      ...shortlist,
      date: parseDate(shortlist.date) ?? new Date(),
    })),
  } as TenderListDTO;
}

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
            organizationId: String((i % 3) + 1),
            budget: {
              amount: Math.floor(amount * 0.6),
              currency: selectedCurrency,
              formatted: `${currencySymbol}${Math.floor(amount * 0.6).toLocaleString()}`
            },
            date: new Date(publishedDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            name: `Joint Venture ${i + 2}`,
            organizationId: String(((i + 1) % 3) + 1),
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
            organizationId: String((i % 3) + 1),
            date: new Date(publishedDate.getTime() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            name: `Consortium Candidate ${i + 3}`,
            organizationId: String(((i + 1) % 3) + 1),
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
  const { isAuthenticated } = useAuth();
  const [tendersData, setTendersData] = useState<PaginatedResponseDTO<TenderListDTO>>({
    data: [],
    meta: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });
  const [kpis, setKpis] = useState<TenderKPIsDTO | null>(null);
  const [filters, setFilters] = useState<TenderFilters>({});
  const [sortBy, setSortBy] = useState<SortField>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [savedTenderIds, setSavedTenderIds] = useState<Set<string>>(new Set());

  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tendersResponse, shortlistsResponse] = await Promise.all([
        tenderService.getAllTenders(),
        isAuthenticated 
          ? organizationService.getMyShortlists().catch(err => {
              console.warn('Failed to fetch my shortlists:', err);
              return [];
            })
          : Promise.resolve([])
      ]);

      const normalizedTenders = (tendersResponse || []).map(normalizeTenderData);

      const mappedShortlists: TenderListDTO[] = (shortlistsResponse || []).map((s: any) => ({
        id: `shortlist-${s.id}`,
        referenceNumber: `SH-${s.id}`,
        title: s.project || s.tenderTitle || 'N/A',
        organizationName: s.donor || s.organizationName || 'N/A',
        country: s.location || 'N/A',
        isMultiCountry: false,
        deadline: s.shortlistedAt ? new Date(s.shortlistedAt) : new Date(),
        daysRemaining: 0,
        budget: {
          amount: s.budget || 0,
          currency: 'EUR',
          formatted: `EUR ${Number(s.budget || 0).toLocaleString()}`
        },
        status: s.status || 'ACTIVE',
        sectors: [],
        createdAt: s.shortlistedAt ? new Date(s.shortlistedAt) : new Date(),
        publishedDate: s.shortlistedAt ? new Date(s.shortlistedAt) : new Date(),
        alertCategory: MatchingAlertCategoryEnum.SHORTLISTS,
        shortlistCompanies: [
          {
            name: `${s.organizationName} (Rank: ${s.rank || 'N/A'}, Score: ${s.score || 'N/A'}%)`,
            organizationId: String(s.organizationId),
            date: s.shortlistedAt ? new Date(s.shortlistedAt) : new Date()
          }
        ],
        comments: s.comments
      }));

      const combined = [...normalizedTenders, ...mappedShortlists];

      setTendersData({
        data: combined,
        meta: {
          page: 1,
          pageSize: combined.length,
          totalItems: combined.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });
    } catch (error) {
      console.error('Failed to fetch tenders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await tenderService.getKPIs();
      setKpis(response);
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

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

  const updateFilters = useCallback((newFilters: Partial<TenderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

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
    tenders: tendersData,
    kpis,
    isLoading,

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

    refreshTenders: fetchTenders,
    getTenderById: tenderService.getTenderById
  };
}
