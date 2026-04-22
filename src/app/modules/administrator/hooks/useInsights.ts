import { useState, useMemo } from 'react';
import {
  InsightsKPIsDTO,
  AnalyticsDataDTO,
  AIInsightDTO,
  TrendDTO,
  OpportunityScoreDTO,
  SectorPerformanceDTO,
  InsightTypeEnum,
  InsightPriorityEnum,
  TimeRangeEnum,
} from '@app/types/insights.dto';
import { ProjectSectorEnum } from '@app/types/project.dto';

// Mock Data
const mockKPIs: InsightsKPIsDTO = {
  totalOpportunities: 247,
  matchingScore: 87,
  activeInsights: 34,
  successRate: 68,
  avgResponseTime: 24,
  trendsIdentified: 12,
};

const mockAnalytics: AnalyticsDataDTO[] = [
  {
    id: 'AN-001',
    sector: ProjectSectorEnum.EDUCATION,
    totalTenders: 145,
    activeTenders: 42,
    successfulBids: 28,
    avgBudget: 350000,
    avgCompetition: 12,
    timeRange: TimeRangeEnum.LAST_90_DAYS,
    trendDirection: 'UP',
    growthRate: 15.3,
    monthlyData: [
      { month: 'Jan', tenders: 35, submissions: 28, wins: 8 },
      { month: 'Feb', tenders: 42, submissions: 35, wins: 10 },
      { month: 'Mar', tenders: 48, submissions: 40, wins: 10 },
    ],
  },
  {
    id: 'AN-002',
    sector: ProjectSectorEnum.HEALTH,
    totalTenders: 198,
    activeTenders: 56,
    successfulBids: 38,
    avgBudget: 520000,
    avgCompetition: 15,
    timeRange: TimeRangeEnum.LAST_90_DAYS,
    trendDirection: 'UP',
    growthRate: 22.7,
    monthlyData: [
      { month: 'Jan', tenders: 52, submissions: 45, wins: 12 },
      { month: 'Feb', tenders: 58, submissions: 50, wins: 13 },
      { month: 'Mar', tenders: 65, submissions: 55, wins: 13 },
    ],
  },
  {
    id: 'AN-003',
    sector: ProjectSectorEnum.ENVIRONMENT,
    totalTenders: 112,
    activeTenders: 34,
    successfulBids: 22,
    avgBudget: 430000,
    avgCompetition: 10,
    timeRange: TimeRangeEnum.LAST_90_DAYS,
    trendDirection: 'STABLE',
    growthRate: 3.2,
    monthlyData: [
      { month: 'Jan', tenders: 35, submissions: 28, wins: 7 },
      { month: 'Feb', tenders: 37, submissions: 30, wins: 7 },
      { month: 'Mar', tenders: 38, submissions: 31, wins: 8 },
    ],
  },
];

const mockAIInsights: AIInsightDTO[] = [
  {
    id: 'AI-001',
    type: InsightTypeEnum.OPPORTUNITY,
    priority: InsightPriorityEnum.HIGH,
    title: 'Emerging Education Technology Opportunities',
    description: 'AI analysis shows a 45% increase in education technology tenders in Sub-Saharan Africa. Your profile matches 87% of these opportunities.',
    sector: ProjectSectorEnum.EDUCATION,
    subsectors: ['DIGITAL_LEARNING', 'CURRICULUM_DEVELOPMENT'],
    confidenceScore: 87,
    potentialValue: 1250000,
    actionRequired: true,
    recommendations: [
      'Update CV to highlight EdTech experience',
      'Apply within next 7 days for best positioning',
      'Consider partnering with local tech firms',
    ],
    relatedOpportunities: 8,
    createdAt: '2024-02-20T10:00:00Z',
    expiresAt: '2024-03-05T23:59:59Z',
    tags: ['EdTech', 'High Match', 'Trending'],
  },
  {
    id: 'AI-002',
    type: InsightTypeEnum.TREND,
    priority: InsightPriorityEnum.MEDIUM,
    title: 'Climate Finance Surge Detected',
    description: 'Climate adaptation and green energy projects have increased by 68% in the last quarter. Strong alignment with your expertise.',
    sector: ProjectSectorEnum.ENVIRONMENT,
    subsectors: ['CLIMATE_ADAPTATION', 'GREEN_ENERGY'],
    confidenceScore: 92,
    potentialValue: 2100000,
    actionRequired: false,
    recommendations: [
      'Monitor climate finance trends closely',
      'Expand network in climate sector',
      'Update profile with recent climate projects',
    ],
    relatedOpportunities: 15,
    createdAt: '2024-02-19T14:30:00Z',
    tags: ['Climate', 'High Volume', 'Growing'],
  },
  {
    id: 'AI-003',
    type: InsightTypeEnum.PREDICTION,
    priority: InsightPriorityEnum.HIGH,
    title: 'Healthcare System Strengthening Wave',
    description: 'Predictive model indicates 35+ healthcare management tenders launching in Q2 2024. Your success probability: 73%.',
    sector: ProjectSectorEnum.HEALTH,
    subsectors: ['HEALTHCARE_MANAGEMENT', 'PUBLIC_HEALTH'],
    confidenceScore: 78,
    potentialValue: 890000,
    actionRequired: true,
    recommendations: [
      'Prepare standard healthcare proposals',
      'Build relationships with health donors',
      'Highlight COVID-19 response experience',
    ],
    relatedOpportunities: 12,
    createdAt: '2024-02-18T09:15:00Z',
    expiresAt: '2024-04-01T23:59:59Z',
    tags: ['Healthcare', 'Predicted', 'High Success'],
  },
  {
    id: 'AI-004',
    type: InsightTypeEnum.RECOMMENDATION,
    priority: InsightPriorityEnum.MEDIUM,
    title: 'Profile Optimization Suggestion',
    description: 'Adding "Digital Transformation" and "M&E Framework" skills could increase your match rate by 23% across 45 active tenders.',
    sector: ProjectSectorEnum.GOVERNANCE,
    subsectors: ['INSTITUTIONAL_DEVELOPMENT', 'PUBLIC_POLICY'],
    confidenceScore: 85,
    potentialValue: 650000,
    actionRequired: false,
    recommendations: [
      'Update profile with digital transformation skills',
      'Add M&E certifications',
      'Showcase relevant case studies',
    ],
    relatedOpportunities: 45,
    createdAt: '2024-02-21T11:00:00Z',
    tags: ['Profile', 'Optimization', 'Skills Gap'],
  },
  {
    id: 'AI-005',
    type: InsightTypeEnum.ALERT,
    priority: InsightPriorityEnum.CRITICAL,
    title: 'High-Value Opportunity Expiring Soon',
    description: 'Perfect match (95%) for $1.2M WASH infrastructure project. Deadline in 48 hours. Immediate action recommended.',
    sector: ProjectSectorEnum.WATER_SANITATION,
    subsectors: ['WATER_MANAGEMENT', 'SANITATION_SYSTEMS'],
    confidenceScore: 95,
    potentialValue: 1200000,
    actionRequired: true,
    recommendations: [
      'Submit application within 48 hours',
      'Use pre-qualified partner network',
      'Leverage similar WASH project experience',
    ],
    relatedOpportunities: 1,
    createdAt: '2024-02-22T08:00:00Z',
    expiresAt: '2024-02-24T17:00:00Z',
    tags: ['Urgent', 'High Value', 'Perfect Match'],
  },
];

const mockTrends: TrendDTO[] = [
  {
    id: 'TR-001',
    sector: ProjectSectorEnum.ENERGY,
    subsector: 'RENEWABLE_ENERGY_SYSTEMS',
    trendName: 'Renewable Energy Acceleration',
    direction: 'RISING',
    strength: 92,
    timeframe: 'Last 90 days',
    volume: 78,
    growthRate: 45.3,
    relatedTenders: 78,
    keyFactors: ['Policy support', 'Climate commitments', 'Funding increase'],
  },
  {
    id: 'TR-002',
    sector: ProjectSectorEnum.EDUCATION,
    subsector: 'DIGITAL_LEARNING',
    trendName: 'Digital Education Expansion',
    direction: 'RISING',
    strength: 85,
    timeframe: 'Last 90 days',
    volume: 62,
    growthRate: 38.7,
    relatedTenders: 62,
    keyFactors: ['Post-pandemic shift', 'Tech adoption', 'Remote learning demand'],
  },
  {
    id: 'TR-003',
    sector: ProjectSectorEnum.AGRICULTURE,
    subsector: 'SUSTAINABLE_FARMING',
    trendName: 'Climate-Smart Agriculture',
    direction: 'RISING',
    strength: 78,
    timeframe: 'Last 90 days',
    volume: 45,
    growthRate: 28.5,
    relatedTenders: 45,
    keyFactors: ['Food security', 'Climate adaptation', 'Technology integration'],
  },
];

const mockOpportunityScores: OpportunityScoreDTO[] = [
  {
    tenderId: 'TND-2024-001',
    tenderTitle: 'Education System Strengthening - East Africa',
    sector: ProjectSectorEnum.EDUCATION,
    matchScore: 95,
    successProbability: 78,
    competitionLevel: 'MEDIUM',
    estimatedEffort: 120,
    potentialROI: 185,
    strengthAreas: ['Regional experience', 'Team expertise', 'Track record'],
    improvementAreas: ['Local partnerships', 'Budget optimization'],
    deadline: '2024-03-15T23:59:59Z',
    budget: 850000,
  },
  {
    tenderId: 'TND-2024-002',
    tenderTitle: 'Climate Resilience Infrastructure Project',
    sector: ProjectSectorEnum.ENVIRONMENT,
    matchScore: 88,
    successProbability: 72,
    competitionLevel: 'HIGH',
    estimatedEffort: 160,
    potentialROI: 165,
    strengthAreas: ['Technical capacity', 'Innovation approach'],
    improvementAreas: ['Environmental certifications', 'Past climate projects'],
    deadline: '2024-03-20T23:59:59Z',
    budget: 1200000,
  },
];

const mockSectorPerformance: SectorPerformanceDTO[] = [
  {
    sector: ProjectSectorEnum.EDUCATION,
    totalOpportunities: 145,
    successfulBids: 28,
    successRate: 68,
    avgMatchScore: 82,
    totalValue: 5200000,
    avgBudget: 350000,
    trendDirection: 'UP',
  },
  {
    sector: ProjectSectorEnum.HEALTH,
    totalOpportunities: 198,
    successfulBids: 38,
    successRate: 72,
    avgMatchScore: 85,
    totalValue: 8400000,
    avgBudget: 520000,
    trendDirection: 'UP',
  },
  {
    sector: ProjectSectorEnum.ENVIRONMENT,
    totalOpportunities: 112,
    successfulBids: 22,
    successRate: 65,
    avgMatchScore: 79,
    totalValue: 4800000,
    avgBudget: 430000,
    trendDirection: 'STABLE',
  },
];

interface InsightsFilters {
  sector?: ProjectSectorEnum[];
  subsector?: string[];
  type?: InsightTypeEnum[];
  priority?: InsightPriorityEnum[];
  timeRange?: TimeRangeEnum;
  searchQuery?: string;
}

export function useInsights() {
  const [filters, setFilters] = useState<InsightsFilters>({
    timeRange: TimeRangeEnum.LAST_90_DAYS,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredAnalytics = useMemo(() => {
    return mockAnalytics.filter((analytics) => {
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(analytics.sector)) return false;
      if (filters.timeRange && analytics.timeRange !== filters.timeRange) return false;
      return true;
    });
  }, [filters]);

  const filteredAIInsights = useMemo(() => {
    return mockAIInsights.filter((insight) => {
      if (filters.type && filters.type.length > 0 && !filters.type.includes(insight.type)) return false;
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(insight.priority)) return false;
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(insight.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && !insight.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          insight.title.toLowerCase().includes(query) ||
          insight.description.toLowerCase().includes(query) ||
          insight.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filters]);

  const filteredTrends = useMemo(() => {
    return mockTrends.filter((trend) => {
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(trend.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && trend.subsector && !filters.subsector.includes(trend.subsector)) return false;
      return true;
    });
  }, [filters]);

  const filteredOpportunityScores = useMemo(() => {
    return mockOpportunityScores.filter((opportunity) => {
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(opportunity.sector)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return opportunity.tenderTitle.toLowerCase().includes(query);
      }
      return true;
    });
  }, [filters]);

  const filteredSectorPerformance = useMemo(() => {
    return mockSectorPerformance.filter((performance) => {
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(performance.sector)) return false;
      return true;
    });
  }, [filters]);

  const paginatedInsights = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredAIInsights.slice(start, end);
  }, [filteredAIInsights, currentPage]);

  const updateFilters = (newFilters: Partial<InsightsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ timeRange: TimeRangeEnum.LAST_90_DAYS });
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => {
    if (v === TimeRangeEnum.LAST_90_DAYS) return false; // default value
    return v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '');
  }).length;

  return {
    kpis: mockKPIs,
    analytics: filteredAnalytics,
    aiInsights: paginatedInsights,
    trends: filteredTrends,
    opportunityScores: filteredOpportunityScores,
    sectorPerformance: filteredSectorPerformance,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    currentPage,
    setCurrentPage,
    totalInsights: filteredAIInsights.length,
    totalAnalytics: filteredAnalytics.length,
    totalTrends: filteredTrends.length,
  };
}
