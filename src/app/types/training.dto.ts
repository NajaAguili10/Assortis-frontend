import { ProjectSectorEnum } from './project.dto';

export enum TrainingLevelEnum {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum TrainingFormatEnum {
  ONLINE = 'ONLINE',
  HYBRID = 'HYBRID',
  IN_PERSON = 'IN_PERSON',
  SELF_PACED = 'SELF_PACED',
}

export enum TrainingStatusEnum {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CertificationStatusEnum {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum SessionStatusEnum {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export interface TrainingCourseDTO {
  id: string;
  title: string;
  description: string;
  sector: ProjectSectorEnum;
  subsectors: string[];
  level: TrainingLevelEnum;
  format: TrainingFormatEnum;
  duration: number; // in hours
  language: 'EN' | 'FR' | 'ES' | 'MULTI';
  instructor: {
    name: string;
    title: string;
    photo?: string;
    courses?: number;
    students?: number;
    rating?: number;
  };
  price: number;
  rating: number;
  enrolledCount: number;
  startDate?: string;
  endDate?: string;
  modules: number;
  certificate: boolean;
  // Certification information
  certificationAvailable?: boolean; // If certification can be obtained separately
  certificationPrice?: number; // Price for certification only
  certificationTitle?: string; // Title of the certification
  certificationIssuer?: string; // Organization issuing the certification
  certificationValidityMonths?: number; // How long the certification is valid (0 = lifetime)
  tags: string[];
  thumbnail?: string;
}

export interface TrainingProgramDTO {
  id: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: string;
  status: TrainingStatusEnum;
  progress: number; // 0-100
  completedModules: number;
  totalModules: number;
  lastAccessDate: string;
  certificateEarned: boolean;
  certificateDate?: string;
  nextSession?: {
    date: string;
    topic: string;
  };
  instructor: {
    name: string;
    photo?: string;
  };
}

export interface TrainingSessionDTO {
  id: string;
  courseId: string;
  courseTitle: string;
  topic: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    photo?: string;
  };
  date: string;
  duration: number; // in minutes
  status: SessionStatusEnum;
  registeredCount: number;
  maxCapacity: number;
  language: 'EN' | 'FR' | 'ES';
  meetingLink?: string;
  recordingUrl?: string;
  materials?: string[];
}

export interface TrainingTrainerDTO {
  id: string;
  name: string;
  title: string;
  organization: string;
  photo?: string;
  bio: string;
  expertise: string[];
  sectors: ProjectSectorEnum[];
  subsectors: string[];
  languages: string[];
  rating: number;
  coursesCount: number;
  studentsCount: number;
  yearsExperience: number;
  certifications: string[];
  linkedIn?: string;
  email?: string;
}

export interface TrainingCertificationDTO {
  id: string;
  title: string;
  description: string;
  sector: ProjectSectorEnum;
  subsectors: string[];
  level: TrainingLevelEnum;
  issuer: string;
  validityPeriod: number; // in months, 0 = lifetime
  requirements: string[];
  passingScore: number; // percentage
  status?: CertificationStatusEnum;
  earnedDate?: string;
  expiryDate?: string;
  credentialId?: string;
  price: number;
  examDuration: number; // in minutes
  attempts: number;
  thumbnail?: string;
}

export interface TrainingKPIsDTO {
  enrolledPrograms: number;
  completedPrograms: number;
  upcomingSessions: number;
  earnedCertifications: number;
  totalLearningHours: number;
  averageProgress: number; // 0-100
}

// Subsectors by sector for Training
export const TRAINING_SUBSECTORS = {
  [ProjectSectorEnum.EDUCATION]: [
    'CURRICULUM_DEVELOPMENT',
    'TEACHER_TRAINING',
    'EDUCATIONAL_LEADERSHIP',
    'ASSESSMENT_EVALUATION',
  ],
  [ProjectSectorEnum.HEALTH]: [
    'HEALTHCARE_MANAGEMENT',
    'PUBLIC_HEALTH',
    'CLINICAL_SKILLS',
    'HEALTH_POLICY',
  ],
  [ProjectSectorEnum.AGRICULTURE]: [
    'SUSTAINABLE_FARMING',
    'AGRICULTURAL_ECONOMICS',
    'FOOD_SAFETY',
    'IRRIGATION_MANAGEMENT',
  ],
  [ProjectSectorEnum.INFRASTRUCTURE]: [
    'PROJECT_MANAGEMENT',
    'URBAN_PLANNING',
    'INFRASTRUCTURE_FINANCE',
    'SUSTAINABLE_INFRASTRUCTURE',
  ],
  [ProjectSectorEnum.GOVERNANCE]: [
    'PUBLIC_POLICY',
    'GOVERNANCE_REFORM',
    'ANTI_CORRUPTION',
    'CIVIC_ENGAGEMENT',
  ],
  [ProjectSectorEnum.ENVIRONMENT]: [
    'CLIMATE_ADAPTATION',
    'ENVIRONMENTAL_MANAGEMENT',
    'CONSERVATION',
    'GREEN_ENERGY',
  ],
  [ProjectSectorEnum.ENERGY]: [
    'RENEWABLE_ENERGY_SYSTEMS',
    'ENERGY_POLICY',
    'SMART_GRIDS',
    'ENERGY_EFFICIENCY',
  ],
  [ProjectSectorEnum.WATER_SANITATION]: [
    'WATER_MANAGEMENT',
    'SANITATION_SYSTEMS',
    'WASTEWATER_TREATMENT',
    'WATER_POLICY',
  ],
  [ProjectSectorEnum.GENDER]: [
    'GENDER_MAINSTREAMING',
    'WOMENS_LEADERSHIP',
    'GBV_RESPONSE',
    'GENDER_ANALYSIS',
  ],
  [ProjectSectorEnum.HUMAN_RIGHTS]: [
    'HUMAN_RIGHTS_LAW',
    'ADVOCACY_STRATEGIES',
    'RIGHTS_BASED_APPROACH',
    'MONITORING_EVALUATION',
  ],
  [ProjectSectorEnum.YOUTH]: [
    'YOUTH_DEVELOPMENT',
    'YOUTH_ENTREPRENEURSHIP',
    'YOUTH_LEADERSHIP',
    'YOUTH_ENGAGEMENT',
  ],
  [ProjectSectorEnum.EMERGENCY_RESPONSE]: [
    'DISASTER_MANAGEMENT',
    'EMERGENCY_PLANNING',
    'HUMANITARIAN_RESPONSE',
    'CRISIS_COMMUNICATION',
  ],
  [ProjectSectorEnum.OTHER]: [],
};