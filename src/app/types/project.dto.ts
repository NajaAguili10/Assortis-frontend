// Project Types and DTOs - Multilingue compatible

export enum ProjectStatusEnum {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export enum ProjectPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ProjectTypeEnum {
  DEVELOPMENT = 'DEVELOPMENT',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  CAPACITY_BUILDING = 'CAPACITY_BUILDING',
  RESEARCH = 'RESEARCH',
  TECHNICAL_ASSISTANCE = 'TECHNICAL_ASSISTANCE',
  HUMANITARIAN = 'HUMANITARIAN',
  PILOT = 'PILOT',
  PROGRAM = 'PROGRAM',
}

export enum ProjectSectorEnum {
  AGRICULTURE = 'AGRICULTURE',
  EDUCATION = 'EDUCATION',
  HEALTH = 'HEALTH',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  GOVERNANCE = 'GOVERNANCE',
  ENVIRONMENT = 'ENVIRONMENT',
  ENERGY = 'ENERGY',
  WATER_SANITATION = 'WATER_SANITATION',
  GENDER = 'GENDER',
  HUMAN_RIGHTS = 'HUMAN_RIGHTS',
  YOUTH = 'YOUTH',
  EMERGENCY_RESPONSE = 'EMERGENCY_RESPONSE',
  OTHER = 'OTHER',
}

// Subsectors mapping (same as SUBSECTOR_MAP in subsectors.config.ts)
export const PROJECT_SUBSECTORS: Record<ProjectSectorEnum, string[]> = {
  [ProjectSectorEnum.EDUCATION]: [
    'PRIMARY_EDUCATION',
    'SECONDARY_EDUCATION',
    'HIGHER_EDUCATION',
    'VOCATIONAL_TRAINING',
    'TEACHER_TRAINING',
    'CURRICULUM_DEVELOPMENT',
  ],
  [ProjectSectorEnum.HEALTH]: [
    'PRIMARY_HEALTHCARE',
    'MATERNAL_CHILD_HEALTH',
    'INFECTIOUS_DISEASES',
    'NUTRITION',
    'MENTAL_HEALTH',
    'HEALTH_SYSTEMS',
  ],
  [ProjectSectorEnum.AGRICULTURE]: [
    'CROP_PRODUCTION',
    'LIVESTOCK',
    'AGRIBUSINESS',
    'FOOD_SECURITY',
    'RURAL_DEVELOPMENT',
    'IRRIGATION',
  ],
  [ProjectSectorEnum.INFRASTRUCTURE]: [
    'ROADS_TRANSPORT',
    'BUILDINGS',
    'TELECOMMUNICATIONS',
    'URBAN_PLANNING',
    'PORTS_AIRPORTS',
    'RAILWAYS',
  ],
  [ProjectSectorEnum.GOVERNANCE]: [
    'PUBLIC_ADMINISTRATION',
    'DEMOCRATIC_GOVERNANCE',
    'JUSTICE_REFORM',
    'ANTI_CORRUPTION',
    'DECENTRALIZATION',
    'CIVIL_SOCIETY',
  ],
  [ProjectSectorEnum.ENVIRONMENT]: [
    'CLIMATE_CHANGE',
    'BIODIVERSITY',
    'WASTE_MANAGEMENT',
    'POLLUTION_CONTROL',
    'SUSTAINABLE_DEVELOPMENT',
    'FOREST_MANAGEMENT',
  ],
  [ProjectSectorEnum.WATER_SANITATION]: [
    'WATER_SUPPLY',
    'SANITATION',
    'HYGIENE',
    'WASTEWATER',
    'WATER_RESOURCES',
    'WASH',
  ],
  [ProjectSectorEnum.ENERGY]: [
    'RENEWABLE_ENERGY',
    'SOLAR',
    'WIND',
    'HYDROPOWER',
    'ENERGY_EFFICIENCY',
    'GRID_INFRASTRUCTURE',
  ],
  [ProjectSectorEnum.GENDER]: [
    'WOMENS_EMPOWERMENT',
    'GENDER_EQUALITY',
    'GBV_PREVENTION',
    'ECONOMIC_EMPOWERMENT',
    'POLITICAL_PARTICIPATION',
    'GIRLS_EDUCATION',
  ],
  [ProjectSectorEnum.HUMAN_RIGHTS]: [
    'CIVIL_RIGHTS',
    'SOCIAL_RIGHTS',
    'CHILD_RIGHTS',
    'INDIGENOUS_RIGHTS',
    'DISABILITY_RIGHTS',
    'REFUGEE_RIGHTS',
  ],
  [ProjectSectorEnum.YOUTH]: [
    'YOUTH_EMPLOYMENT',
    'YOUTH_PARTICIPATION',
    'YOUTH_SKILLS',
    'YOUTH_ENTREPRENEURSHIP',
    'YOUTH_HEALTH',
    'YOUTH_EDUCATION',
  ],
  [ProjectSectorEnum.EMERGENCY_RESPONSE]: [
    'DISASTER_RELIEF',
    'HUMANITARIAN_AID',
    'CONFLICT_RESPONSE',
    'REFUGEE_ASSISTANCE',
    'EARLY_RECOVERY',
    'PREPAREDNESS',
  ],
  [ProjectSectorEnum.OTHER]: [
    'RESEARCH',
    'CAPACITY_BUILDING',
    'TECHNICAL_ASSISTANCE',
    'MONITORING_EVALUATION',
    'CROSS_CUTTING',
    'MULTI_SECTORAL',
  ],
};

export enum RegionEnum {
  AFRICA_WEST = 'AFRICA_WEST',
  AFRICA_EAST = 'AFRICA_EAST',
  AFRICA_CENTRAL = 'AFRICA_CENTRAL',
  AFRICA_NORTH = 'AFRICA_NORTH',
  AFRICA_SOUTHERN = 'AFRICA_SOUTHERN',
  ASIA_PACIFIC = 'ASIA_PACIFIC',
  EUROPE = 'EUROPE',
  MIDDLE_EAST = 'MIDDLE_EAST',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA',
  CARIBBEAN = 'CARIBBEAN',
  OCEANIA = 'OCEANIA',
}

export interface ProjectBudgetDTO {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
}

export interface ProjectTimelineDTO {
  startDate: string;
  endDate: string;
  duration: number; // in months
  completionPercentage: number;
}

export interface ProjectTeamMemberDTO {
  id: string;
  name: string;
  role: string;
  organization?: string;
  avatar?: string;
}

export interface ProjectMilestoneDTO {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

export interface ProjectListDTO {
  id: string;
  organizationId?: string;
  code: string;
  title: string;
  description: string;
  status: ProjectStatusEnum;
  priority: ProjectPriorityEnum;

  country: string;
  region: RegionEnum;

  sector: ProjectSectorEnum;
  subsectors: string[];
  
  // Financial
  budget: ProjectBudgetDTO;
  
  // Timeline
  timeline: ProjectTimelineDTO;
  
  // Team
  leadOrganization: string;
  partners: string[];
  teamSize: number;
  
  // Stats
  tasksCompleted: number;
  totalTasks: number;
  
  // Metadata
  createdDate: string;
  updatedDate: string;
}

export interface ProjectDetailDTO extends ProjectListDTO {
  objectives: string[];
  deliverables: string[];
  risks: string[];
  
  team: ProjectTeamMemberDTO[];
  milestones: ProjectMilestoneDTO[];
  
  // Additional details
  beneficiaries?: number;
  impactArea?: string;
  fundingSource?: string;
  relatedProjects?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedDate: string;
  }[];
}

export interface ProjectKPIsDTO {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  budgetSpent: number;
  averageCompletion: number;
  urgentProjects: number;
}

export interface ProjectFiltersDTO {
  searchQuery?: string;
  status?: ProjectStatusEnum[];
  priority?: ProjectPriorityEnum[];
  type?: ProjectTypeEnum[];
  sector?: ProjectSectorEnum[];
  subsector?: string[];
  region?: RegionEnum[];
  minBudget?: number;
  maxBudget?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  leadOrganization?: string[];
  partners?: string[];
}

export interface TaskDTO {
  id?: number;
  projectId: number;

  title: string;
  description?: string;

  status?: string;   
  priority?: string;
  assignedTo?: Record<string, any>;

  startDate?: string;
  dueDate?: string;
  completedDate?: string;

  tags?: Record<string, any>;
  taskCode?: string;
  estimatedHours?: number;
  isMilestone?: boolean;
  estimatedBudget?: number;

  resourcesRequired?: string;

  deliverables?: Record<string, any>;

  category?: string;
  complexity?: string;

  parentTaskId?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface CollaborationDTO {
  id: string;
  projectId: string;
  projectTitle: string;
  partnerOrganization: string;
  type: 'FUNDING' | 'TECHNICAL' | 'IMPLEMENTATION' | 'ADVISORY';
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  startDate: string;
  endDate?: string;
  contribution?: string;
}

export interface ProjectTemplateDTO {
  id: string;
  name: string;
  description: string;
  sector: ProjectSectorEnum;
  type: ProjectTypeEnum;
  estimatedDuration: number; // months
  estimatedBudget: number;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdDate: string;
}

export interface PaginationMetaDTO {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponseDTO<T> {
  data: T[];
  meta: PaginationMetaDTO;
}