import { ProjectSectorEnum } from './project.dto';

export enum InsightTypeEnum {
  OPPORTUNITY = 'OPPORTUNITY',
  TREND = 'TREND',
  PREDICTION = 'PREDICTION',
  RECOMMENDATION = 'RECOMMENDATION',
  ALERT = 'ALERT',
}

export enum InsightPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TimeRangeEnum {
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
  LAST_YEAR = 'LAST_YEAR',
  ALL_TIME = 'ALL_TIME',
}

export interface InsightsKPIsDTO {
  totalOpportunities: number;
  matchingScore: number; // 0-100
  activeInsights: number;
  successRate: number; // percentage
  avgResponseTime: number; // in hours
  trendsIdentified: number;
}

export interface AnalyticsDataDTO {
  id: string;
  sector: ProjectSectorEnum;
  subsector?: string;
  totalTenders: number;
  activeTenders: number;
  successfulBids: number;
  avgBudget: number;
  avgCompetition: number;
  timeRange: TimeRangeEnum;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
  growthRate: number; // percentage
  monthlyData: {
    month: string;
    tenders: number;
    submissions: number;
    wins: number;
  }[];
}

export interface AIInsightDTO {
  id: string;
  type: InsightTypeEnum;
  priority: InsightPriorityEnum;
  title: string;
  description: string;
  sector: ProjectSectorEnum;
  subsectors: string[];
  confidenceScore: number; // 0-100
  potentialValue: number; // estimated value in USD
  actionRequired: boolean;
  recommendations: string[];
  relatedOpportunities: number;
  createdAt: string;
  expiresAt?: string;
  tags: string[];
}

export interface TrendDTO {
  id: string;
  sector: ProjectSectorEnum;
  subsector?: string;
  trendName: string;
  direction: 'RISING' | 'DECLINING' | 'STABLE';
  strength: number; // 0-100
  timeframe: string;
  volume: number;
  growthRate: number; // percentage
  relatedTenders: number;
  keyFactors: string[];
}

export interface OpportunityScoreDTO {
  tenderId: string;
  tenderTitle: string;
  sector: ProjectSectorEnum;
  matchScore: number; // 0-100
  successProbability: number; // 0-100
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedEffort: number; // in hours
  potentialROI: number; // percentage
  strengthAreas: string[];
  improvementAreas: string[];
  deadline: string;
  budget: number;
}

export interface SectorPerformanceDTO {
  sector: ProjectSectorEnum;
  totalOpportunities: number;
  successfulBids: number;
  successRate: number; // percentage
  avgMatchScore: number; // 0-100
  totalValue: number;
  avgBudget: number;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
}

export interface GeographicInsightDTO {
  country: string;
  region: string;
  totalTenders: number;
  activeTenders: number;
  avgBudget: number;
  topSectors: ProjectSectorEnum[];
  growthRate: number; // percentage
  opportunityScore: number; // 0-100
}

export interface CompetitiveAnalysisDTO {
  tenderId: string;
  estimatedCompetitors: number;
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  avgCompetitorExperience: number; // years
  winProbability: number; // 0-100
  differentiationFactors: string[];
  marketPosition: 'LEADER' | 'CHALLENGER' | 'FOLLOWER';
}

// Subsectors for Analytics (can reuse from training or projects)
export const INSIGHTS_SUBSECTORS = {
  [ProjectSectorEnum.EDUCATION]: [
    'CURRICULUM_DEVELOPMENT',
    'TEACHER_TRAINING',
    'EDUCATIONAL_LEADERSHIP',
    'ASSESSMENT_EVALUATION',
    'DIGITAL_LEARNING',
  ],
  [ProjectSectorEnum.HEALTH]: [
    'HEALTHCARE_MANAGEMENT',
    'PUBLIC_HEALTH',
    'CLINICAL_SKILLS',
    'HEALTH_POLICY',
    'DISEASE_PREVENTION',
  ],
  [ProjectSectorEnum.AGRICULTURE]: [
    'SUSTAINABLE_FARMING',
    'AGRICULTURAL_ECONOMICS',
    'FOOD_SAFETY',
    'IRRIGATION_MANAGEMENT',
    'CROP_MANAGEMENT',
  ],
  [ProjectSectorEnum.INFRASTRUCTURE]: [
    'PROJECT_MANAGEMENT',
    'URBAN_PLANNING',
    'INFRASTRUCTURE_FINANCE',
    'SUSTAINABLE_INFRASTRUCTURE',
    'TRANSPORTATION',
  ],
  [ProjectSectorEnum.GOVERNANCE]: [
    'PUBLIC_POLICY',
    'GOVERNANCE_REFORM',
    'ANTI_CORRUPTION',
    'CIVIC_ENGAGEMENT',
    'INSTITUTIONAL_DEVELOPMENT',
  ],
  [ProjectSectorEnum.ENVIRONMENT]: [
    'CLIMATE_ADAPTATION',
    'ENVIRONMENTAL_MANAGEMENT',
    'CONSERVATION',
    'GREEN_ENERGY',
    'BIODIVERSITY',
  ],
  [ProjectSectorEnum.ENERGY]: [
    'RENEWABLE_ENERGY_SYSTEMS',
    'ENERGY_POLICY',
    'SMART_GRIDS',
    'ENERGY_EFFICIENCY',
    'CLEAN_ENERGY',
  ],
  [ProjectSectorEnum.WATER_SANITATION]: [
    'WATER_MANAGEMENT',
    'SANITATION_SYSTEMS',
    'WASTEWATER_TREATMENT',
    'WATER_POLICY',
    'WATER_QUALITY',
  ],
  [ProjectSectorEnum.GENDER]: [
    'GENDER_MAINSTREAMING',
    'WOMENS_LEADERSHIP',
    'GBV_RESPONSE',
    'GENDER_ANALYSIS',
    'ECONOMIC_EMPOWERMENT',
  ],
  [ProjectSectorEnum.HUMAN_RIGHTS]: [
    'HUMAN_RIGHTS_LAW',
    'ADVOCACY_STRATEGIES',
    'RIGHTS_BASED_APPROACH',
    'MONITORING_EVALUATION',
    'JUSTICE_SYSTEMS',
  ],
  [ProjectSectorEnum.YOUTH]: [
    'YOUTH_DEVELOPMENT',
    'YOUTH_ENTREPRENEURSHIP',
    'YOUTH_LEADERSHIP',
    'YOUTH_ENGAGEMENT',
    'SKILLS_TRAINING',
  ],
  [ProjectSectorEnum.EMERGENCY_RESPONSE]: [
    'DISASTER_MANAGEMENT',
    'EMERGENCY_PLANNING',
    'HUMANITARIAN_RESPONSE',
    'CRISIS_COMMUNICATION',
    'RECOVERY_PLANNING',
  ],
  [ProjectSectorEnum.OTHER]: [],
};
