import { useState, useMemo } from 'react';
import {
  MatchingOpportunityDTO,
  MatchingOpportunitiesContextDTO,
  MatchingOpportunitiesFilterDTO,
  MatchingProjectsFilterDTO,
  MatchingTenderFiltersDTO,
  MatchingVacancyFiltersDTO,
  OpportunityTypeEnum,
  OpportunityStatusEnum,
  CVStatsDTO,
  SIPInfoDTO,
  PendingMatchDTO,
  MatchingStatsDTO,
  MatchingProfileDTO,
  AlertFusionConfigDTO,
  AlertFrequency,
} from '@app/types/matchingOpportunities.dto';
import { ProjectSectorEnum } from '@app/types/project.dto';
import {
  CountryEnum,
  RegionEnum,
  SECTOR_SUBSECTOR_MAP,
  REGION_COUNTRY_MAP,
} from '@app/types/tender.dto';

// Mock data for all opportunities
const MOCK_OPPORTUNITIES: MatchingOpportunityDTO[] = [
  // Open Projects
  {
    id: 'opp-001',
    title: 'Sustainable Agriculture Development in East Africa',
    type: OpportunityTypeEnum.OPEN_PROJECT,
    donor: 'African Development Bank',
    country: 'Kenya',
    sector: ProjectSectorEnum.AGRICULTURE,
    keywords: ['agriculture', 'sustainability', 'rural development', 'capacity building'],
    relevanceScore: 95,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    budget: 2500000,
    currency: 'USD',
    description: 'Comprehensive agricultural infrastructure and technical assistance project',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    organization: 'African Development Bank',
    location: 'Kenya',
    matchedViaProfile: 'Africa Agriculture Profile',
  },
  {
    id: 'opp-002',
    title: 'Water Sanitation and Hygiene Project - West Africa',
    type: OpportunityTypeEnum.OPEN_PROJECT,
    donor: 'World Bank',
    country: 'Ghana',
    sector: ProjectSectorEnum.WATER_SANITATION,
    keywords: ['water', 'sanitation', 'hygiene', 'infrastructure'],
    relevanceScore: 88,
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    budget: 4500000,
    currency: 'USD',
    description: 'Regional water sanitation and hygiene infrastructure development',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    organization: 'World Bank',
    location: 'Ghana',
    matchedViaAlert: 'World Bank WASH Alert',
  },
  {
    id: 'opp-003',
    title: 'Health Systems Strengthening Program',
    type: OpportunityTypeEnum.OPEN_PROJECT,
    donor: 'Global Fund',
    country: 'Uganda',
    sector: ProjectSectorEnum.HEALTH,
    keywords: ['health', 'systems strengthening', 'capacity building', 'training'],
    relevanceScore: 82,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    budget: 3000000,
    currency: 'USD',
    description: 'Healthcare system capacity enhancement and staff training initiative',
    status: OpportunityStatusEnum.CLOSING_SOON,
    postedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    organization: 'Global Fund',
    location: 'Uganda',
    matchedViaProfile: 'Health Systems Profile',
  },

  // Contract Awards
  {
    id: 'opp-004',
    title: 'Infrastructure Consulting Services - Road Networks',
    type: OpportunityTypeEnum.CONTRACT_AWARD,
    donor: 'European Bank for Reconstruction',
    country: 'Morocco',
    sector: ProjectSectorEnum.INFRASTRUCTURE,
    keywords: ['infrastructure', 'roads', 'consulting', 'engineering'],
    relevanceScore: 79,
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    contractValue: 1500000,
    currency: 'EUR',
    description: 'Technical design and feasibility studies for road network expansion',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    organization: 'European Bank for Reconstruction',
    location: 'Morocco',
    matchedViaAlert: 'Infrastructure Consulting Alert',
    awardCompanies: [
      {
        name: 'Atlas Engineering Group',
        amount: 850000,
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'North Corridor Consulting',
        amount: 650000,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: 'opp-005',
    title: 'Education Quality Improvement Consulting',
    type: OpportunityTypeEnum.CONTRACT_AWARD,
    donor: 'UNICEF',
    country: 'Senegal',
    sector: ProjectSectorEnum.EDUCATION,
    keywords: ['education', 'quality improvement', 'curriculum', 'teacher training'],
    relevanceScore: 85,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    contractValue: 800000,
    currency: 'USD',
    description: 'Curriculum development and teacher training program implementation',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    organization: 'UNICEF',
    location: 'Senegal',
    matchedViaProfile: 'Education & Training Profile',
    awardCompanies: [
      {
        name: 'EduTech Advisory',
        amount: 500000,
        date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    ],
  },

  // Shortlists
  {
    id: 'opp-006',
    title: 'Urban Planning Strategic Assessment',
    type: OpportunityTypeEnum.SHORTLIST,
    donor: 'UN-Habitat',
    country: 'Tanzania',
    sector: ProjectSectorEnum.INFRASTRUCTURE,
    keywords: ['urban planning', 'strategic assessment', 'governance'],
    relevanceScore: 91,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    budget: 500000,
    currency: 'USD',
    description: 'Strategic urban planning and governance assessment',
    status: OpportunityStatusEnum.CLOSING_SOON,
    postedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    organization: 'UN-Habitat',
    location: 'Tanzania',
    shortlistCompanies: [
      {
        name: 'Urban Futures Advisory',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Civic Planning Partners',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: 'opp-007',
    title: 'Environmental Impact Study',
    type: OpportunityTypeEnum.SHORTLIST,
    donor: 'UNEP',
    country: 'Nigeria',
    sector: ProjectSectorEnum.ENVIRONMENT,
    keywords: ['environment', 'impact assessment', 'sustainability'],
    relevanceScore: 76,
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    budget: 350000,
    currency: 'USD',
    description: 'Environmental impact and sustainability assessment study',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    organization: 'UNEP',
    location: 'Nigeria',
    shortlistCompanies: [
      {
        name: 'Green Metrics Labs',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  },

  // Project Vacancies
  {
    id: 'opp-008',
    title: 'Senior Project Manager - Regional Office',
    type: OpportunityTypeEnum.PROJECT_VACANCY,
    donor: 'World Bank',
    country: 'Ethiopia',
    sector: ProjectSectorEnum.AGRICULTURE,
    keywords: ['project management', 'leadership', 'rural development'],
    relevanceScore: 87,
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    description: 'Lead regional agricultural development initiatives',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    position: 'Senior Project Manager',
    organization: 'World Bank',
    location: 'Ethiopia',
    matchedViaProfile: 'Africa Agriculture Profile',
  },
  {
    id: 'opp-009',
    title: 'Technical Specialist - Water Systems',
    type: OpportunityTypeEnum.PROJECT_VACANCY,
    donor: 'UN-Water',
    country: 'Zambia',
    sector: ProjectSectorEnum.WATER_SANITATION,
    keywords: ['water systems', 'engineering', 'technical support'],
    relevanceScore: 80,
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    description: 'Provide technical expertise for water infrastructure projects',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    position: 'Technical Specialist',
    organization: 'UN-Water',
    location: 'Zambia',
  },

  // In-house Vacancies
  {
    id: 'opp-010',
    title: 'Training Coordinator - Capacity Building Division',
    type: OpportunityTypeEnum.IN_HOUSE_VACANCY,
    donor: 'Internal - Platform',
    country: 'Remote',
    sector: ProjectSectorEnum.OTHER,
    keywords: ['training', 'coordination', 'capacity building'],
    relevanceScore: 73,
    deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
    description: 'Coordinate and deliver training programs for platform users',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    position: 'Training Coordinator',
    organization: 'Assortis Platform',
    location: 'Remote',
    matchedViaAlert: 'Platform Vacancies Alert',
  },
  {
    id: 'opp-011',
    title: 'Research Analyst - Tender Intelligence',
    type: OpportunityTypeEnum.IN_HOUSE_VACANCY,
    donor: 'Internal - Platform',
    country: 'Remote',
    sector: ProjectSectorEnum.OTHER,
    keywords: ['research', 'analysis', 'tender intelligence'],
    relevanceScore: 75,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    description: 'Analyze and research tender trends and opportunities',
    status: OpportunityStatusEnum.ACTIVE,
    postedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    position: 'Research Analyst',
    organization: 'Assortis Platform',
    location: 'Remote',
  },
];

// Mock pending matches
const MOCK_PENDING_MATCHES: PendingMatchDTO[] = [
  {
    id: 'match-001',
    organizationName: 'African Development Bank',
    mutualInterest: true,
    interestPercentage: 92,
    lastInteractionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'interested',
  },
  {
    id: 'match-002',
    organizationName: 'World Bank - Africa Region',
    mutualInterest: true,
    interestPercentage: 85,
    lastInteractionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'pending',
  },
  {
    id: 'match-003',
    organizationName: 'Global Fund',
    mutualInterest: false,
    interestPercentage: 72,
    lastInteractionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: 'connected',
  },
];

// Mock CV stats
const MOCK_CV_STATS: CVStatsDTO = {
  previewsEN: 4,
  downloadsEN: 0,
  previewsFR: 29,
  downloadsFR: 0,
  previewsES: 11,
  downloadsES: 0,
  registeredDate: new Date('2025-04-30'),
};

// Mock SIP info
const MOCK_SIP_INFO: SIPInfoDTO = {
  isActive: true,
  countries: 238,
  sectors: 36,
  fundingAgencies: 173,
  expiryDate: new Date('2027-10-20'),
};

function readDismissedIds(): string[] {
  try {
    const stored = localStorage.getItem('matching.dismissedIds');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeDismissedIds(ids: string[]) {
  try {
    localStorage.setItem('matching.dismissedIds', JSON.stringify(ids));
  } catch {
    // ignore
  }
}

// --- Saved profiles storage helpers ---
const MOCK_PROFILES: MatchingProfileDTO[] = [
  {
    id: 'profile-001',
    name: 'Africa Agriculture Profile',
    sectors: ['AGRICULTURE', 'RURAL_DEVELOPMENT'],
    countries: ['Kenya', 'Ethiopia', 'Tanzania'],
    donors: ['African Development Bank', 'World Bank'],
    keywords: ['agriculture', 'rural development', 'capacity building'],
    isActive: true,
    alertFrequency: 'daily',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    matchCount: 3,
  },
  {
    id: 'profile-002',
    name: 'Health Systems Profile',
    sectors: ['HEALTH'],
    countries: ['Uganda', 'Rwanda', 'DRC'],
    donors: ['Global Fund', 'WHO', 'USAID'],
    keywords: ['health', 'systems strengthening', 'training'],
    isActive: true,
    alertFrequency: 'weekly',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    matchCount: 1,
  },
  {
    id: 'profile-003',
    name: 'Education & Training Profile',
    sectors: ['EDUCATION'],
    countries: ['Senegal', 'Mali', 'Ivory Coast'],
    donors: ['UNICEF', 'UNESCO', 'AFD'],
    keywords: ['education', 'curriculum', 'teacher training'],
    isActive: false,
    alertFrequency: 'none',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    matchCount: 1,
  },
];

const DEFAULT_ALERT_CONFIG: AlertFusionConfigDTO = {
  globalFrequency: 'daily',
  deduplicationEnabled: true,
  profileSettings: MOCK_PROFILES.map(p => ({
    profileId: p.id,
    isEnabled: p.isActive,
    frequency: p.alertFrequency,
  })),
};

export function useMatchingOpportunities() {
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => readDismissedIds());
  const [profiles, setProfiles] = useState<MatchingProfileDTO[]>(MOCK_PROFILES);
  const [alertConfig, setAlertConfig] = useState<AlertFusionConfigDTO>(DEFAULT_ALERT_CONFIG);

  const allOpportunities = useMemo(() => MOCK_OPPORTUNITIES, []);

  const stats = useMemo<MatchingStatsDTO>(() => {
    const matching = allOpportunities.filter(opp => opp.relevanceScore >= 75);
    return {
      totalOpportunities: allOpportunities.length,
      matchingOpportunities: matching.length,
      averageRelevance: Math.round(
        matching.reduce((sum, opp) => sum + opp.relevanceScore, 0) / matching.length || 0
      ),
      lastUpdated: new Date(),
    };
  }, [allOpportunities]);

  const getFilteredOpportunities = (filters: MatchingOpportunitiesFilterDTO) => {
    return allOpportunities.filter(opp => {
      // Type filter
      if (filters.type !== 'ALL' && opp.type !== filters.type) return false;

      // Sector filter
      if (filters.sector !== 'ALL' && opp.sector !== filters.sector) return false;

      // Country filter
      if (filters.country !== 'ALL' && opp.country !== filters.country) return false;

      // Deadline filter
      if (filters.deadline !== 'all') {
        const daysUntilDeadline = Math.floor(
          (opp.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        switch (filters.deadline) {
          case '7days':
            if (daysUntilDeadline > 7) return false;
            break;
          case '30days':
            if (daysUntilDeadline > 30) return false;
            break;
          case '90days':
            if (daysUntilDeadline > 90) return false;
            break;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          opp.title.toLowerCase().includes(searchLower) ||
          opp.donor.toLowerCase().includes(searchLower) ||
          opp.country.toLowerCase().includes(searchLower) ||
          opp.keywords.some(k => k.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  };

  const getFilteredTenderOpportunities = (filters: MatchingTenderFiltersDTO) => {
    return allOpportunities.filter(opp => {
      if (
        opp.type !== OpportunityTypeEnum.OPEN_PROJECT &&
        opp.type !== OpportunityTypeEnum.CONTRACT_AWARD &&
        opp.type !== OpportunityTypeEnum.SHORTLIST
      ) {
        return false;
      }

      if (opp.type !== filters.activeType) return false;

      if (filters.searchInput.trim()) {
        const haystack = `${opp.title} ${opp.donor} ${opp.organization ?? ''} ${opp.keywords.join(' ')}`.toLowerCase();
        const query = filters.searchInput.toLowerCase();

        if (filters.searchMode === 'exactPhrase' && !haystack.includes(query)) return false;

        if (filters.searchMode === 'anyWords') {
          const words = query.split(/\s+/).filter(Boolean);
          if (!words.some(word => haystack.includes(word))) return false;
        }

        if (filters.searchMode === 'allWords') {
          const words = query.split(/\s+/).filter(Boolean);
          if (!words.every(word => haystack.includes(word))) return false;
        }

        if (filters.searchMode === 'boolean') {
          if (query.includes(' and ')) {
            const words = query.split(' and ').map(item => item.trim()).filter(Boolean);
            if (!words.every(word => haystack.includes(word))) return false;
          } else if (query.includes(' or ')) {
            const words = query.split(' or ').map(item => item.trim()).filter(Boolean);
            if (!words.some(word => haystack.includes(word))) return false;
          } else if (!haystack.includes(query)) {
            return false;
          }
        }
      }

      if (filters.publishedFrom && opp.postedDate < filters.publishedFrom) return false;
      if (filters.publishedTo && opp.postedDate > filters.publishedTo) return false;

      const numericBudget = opp.budget ?? opp.contractValue ?? 0;
      const budgetTarget = Number(filters.budgetValue || '0');
      if (filters.budgetMode === 'above' && filters.budgetValue && numericBudget < budgetTarget) return false;
      if (filters.budgetMode === 'below' && filters.budgetValue && numericBudget > budgetTarget) return false;

      if (filters.selectedSectors.length > 0 && !filters.selectedSectors.includes(opp.sector as any)) {
        return false;
      }

      if (filters.selectedSubSectors.length > 0) {
        const possibleSubsectors = SECTOR_SUBSECTOR_MAP[opp.sector as any] || [];
        const hasMatchingSubsector = filters.selectedSubSectors.some(sub => possibleSubsectors.includes(sub));
        if (!hasMatchingSubsector) return false;
      }

      if (filters.selectedRegions.length > 0) {
        const matchesRegion = filters.selectedRegions.some(region => {
          const countries = REGION_COUNTRY_MAP[region as RegionEnum] || [];
          return countries.includes(opp.country as CountryEnum);
        });
        if (!matchesRegion) return false;
      }

      if (filters.selectedCountries.length > 0 && !filters.selectedCountries.includes(opp.country as CountryEnum)) {
        return false;
      }

      return true;
    });
  };

  const getFilteredVacancyOpportunities = (filters: MatchingVacancyFiltersDTO) => {
    const rows = allOpportunities.filter(opp => {
      if (
        opp.type !== OpportunityTypeEnum.PROJECT_VACANCY &&
        opp.type !== OpportunityTypeEnum.IN_HOUSE_VACANCY
      ) {
        return false;
      }

      if (opp.type !== filters.activeType) return false;

      if (filters.searchInput.trim()) {
        const haystack = `${opp.title} ${opp.description} ${opp.organization ?? ''} ${opp.location ?? ''}`.toLowerCase();
        if (!haystack.includes(filters.searchInput.toLowerCase())) return false;
      }

      if (filters.status !== 'all') {
        if (filters.status === 'active' && opp.status !== OpportunityStatusEnum.ACTIVE) return false;
        if (filters.status === 'closing-soon' && opp.status !== OpportunityStatusEnum.CLOSING_SOON) return false;
        if (filters.status === 'closed' && opp.status !== OpportunityStatusEnum.CLOSED) return false;
      }

      if (filters.location !== 'all' && (opp.location ?? '').toLowerCase() !== filters.location.toLowerCase()) {
        return false;
      }

      if (filters.department !== 'all' && filters.activeType === OpportunityTypeEnum.IN_HOUSE_VACANCY) {
        if ((opp.sector ?? '').toLowerCase() !== filters.department.toLowerCase()) return false;
      }

      const daysUntilDeadline = Math.floor((opp.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (filters.deadline === 'urgent' && (daysUntilDeadline < 0 || daysUntilDeadline > 7)) return false;
      if (filters.deadline === 'month' && (daysUntilDeadline < 0 || daysUntilDeadline > 30)) return false;
      if (filters.deadline === 'expired' && daysUntilDeadline >= 0) return false;

      return true;
    });

    return [...rows].sort((a, b) => {
      if (filters.sort === 'newest') return b.postedDate.getTime() - a.postedDate.getTime();
      if (filters.sort === 'oldest') return a.postedDate.getTime() - b.postedDate.getTime();
      if (filters.sort === 'deadline') return a.deadline.getTime() - b.deadline.getTime();
      return a.title.localeCompare(b.title);
    });
  };

  const getFilteredMatchingProjects = (filters: MatchingProjectsFilterDTO) => {
    const now = Date.now();
    const dateRangeMs: Record<string, number> = {
      '5days': 5 * 24 * 60 * 60 * 1000,
      '7days': 7 * 24 * 60 * 60 * 1000,
      '30days': 30 * 24 * 60 * 60 * 1000,
    };

    const active = allOpportunities.filter(opp => !dismissedIds.includes(opp.id));
    let result = active.filter(opp => {
      if (filters.category !== 'ALL' && opp.type !== filters.category) return false;
      if (filters.country !== 'ALL' && opp.country !== filters.country) return false;
      if (filters.minScore > 0 && opp.relevanceScore < filters.minScore) return false;

      // Date range filter
      if (filters.dateRange === 'custom') {
        if (filters.customDateFrom) {
          const from = new Date(filters.customDateFrom).getTime();
          if (opp.postedDate.getTime() < from) return false;
        }
        if (filters.customDateTo) {
          const to = new Date(filters.customDateTo).getTime() + 24 * 60 * 60 * 1000;
          if (opp.postedDate.getTime() > to) return false;
        }
      } else {
        const cutoff = now - (dateRangeMs[filters.dateRange] ?? dateRangeMs['5days']);
        if (opp.postedDate.getTime() < cutoff) return false;
      }

      return true;
    });
    if (filters.sort === 'date') {
      result = [...result].sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());
    } else {
      result = [...result].sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    return result;
  };

  const getOpportunityById = (opportunityId: string) => {
    return allOpportunities.find(opp => opp.id === opportunityId);
  };

  const dismissOpportunity = (opportunityId: string) => {
    setDismissedIds(prev => {
      const next = prev.includes(opportunityId) ? prev : [...prev, opportunityId];
      writeDismissedIds(next);
      return next;
    });
  };

  const isDismissed = (opportunityId: string) => dismissedIds.includes(opportunityId);

  const getDismissedOpportunities = () =>
    allOpportunities.filter(opp => dismissedIds.includes(opp.id));

  // --- Profile CRUD ---
  const createProfile = (data: Omit<MatchingProfileDTO, 'id' | 'createdAt' | 'matchCount'>) => {
    const newProfile: MatchingProfileDTO = {
      ...data,
      id: `profile-${Date.now()}`,
      createdAt: new Date(),
      matchCount: 0,
    };
    setProfiles(prev => [...prev, newProfile]);
    setAlertConfig(prev => ({
      ...prev,
      profileSettings: [
        ...prev.profileSettings,
        { profileId: newProfile.id, isEnabled: data.isActive, frequency: data.alertFrequency },
      ],
    }));
    return newProfile;
  };

  const updateProfile = (id: string, data: Partial<Omit<MatchingProfileDTO, 'id' | 'createdAt'>>) => {
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    setAlertConfig(prev => ({
      ...prev,
      profileSettings: prev.profileSettings.filter(s => s.profileId !== id),
    }));
  };

  const getProfileMatches = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return [];
    return allOpportunities.filter(
      opp =>
        opp.matchedViaProfile === profile.name ||
        profile.sectors.some(s => opp.sector.includes(s)) ||
        profile.countries.includes(opp.country)
    );
  };

  // --- Alert Fusion ---
  const updateAlertConfig = (config: Partial<AlertFusionConfigDTO>) => {
    setAlertConfig(prev => ({ ...prev, ...config }));
  };

  const updateProfileAlertSettings = (profileId: string, frequency: AlertFrequency, isEnabled: boolean) => {
    setAlertConfig(prev => ({
      ...prev,
      profileSettings: prev.profileSettings.map(s =>
        s.profileId === profileId ? { ...s, frequency, isEnabled } : s
      ),
    }));
  };

  const saveOpportunity = (opportunityId: string) => {
    setSavedOpportunityIds(prev =>
      prev.includes(opportunityId) ? prev : [...prev, opportunityId]
    );
  };

  const removeOpportunity = (opportunityId: string) => {
    setSavedOpportunityIds(prev => prev.filter(id => id !== opportunityId));
  };

  const getSavedOpportunities = () => {
    return allOpportunities.filter(opp => savedOpportunityIds.includes(opp.id));
  };

  const getOpportunitiesByType = (type: OpportunityTypeEnum) => {
    return allOpportunities.filter(opp => opp.type === type);
  };

  const context: MatchingOpportunitiesContextDTO = {
    opportunities: allOpportunities,
    stats,
    cvStats: MOCK_CV_STATS,
    sipInfo: MOCK_SIP_INFO,
    pendingMatches: MOCK_PENDING_MATCHES,
    savedOpportunities: savedOpportunityIds,
  };

  return {
    ...context,
    getFilteredOpportunities,
    getFilteredTenderOpportunities,
    getFilteredVacancyOpportunities,
    getFilteredMatchingProjects,
    getOpportunityById,
    saveOpportunity,
    removeOpportunity,
    getSavedOpportunities,
    getOpportunitiesByType,
    isSaved: (opportunityId: string) => savedOpportunityIds.includes(opportunityId),
    dismissOpportunity,
    isDismissed,
    getDismissedOpportunities,
    // Profiles
    profiles,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileMatches,
    // Alerts
    alertConfig,
    updateAlertConfig,
    updateProfileAlertSettings,
  };
}
