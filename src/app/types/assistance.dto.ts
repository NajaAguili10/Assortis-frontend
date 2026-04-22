import { ProjectSectorEnum } from './project.dto';

export enum AssistanceTypeEnum {
  TECHNICAL = 'TECHNICAL',
  STRATEGIC = 'STRATEGIC',
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  LEGAL = 'LEGAL',
  COMMUNICATION = 'COMMUNICATION',
}

export enum AssistanceStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum AssistancePriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ResourceTypeEnum {
  GUIDE = 'GUIDE',
  TEMPLATE = 'TEMPLATE',
  TOOLKIT = 'TOOLKIT',
  CASE_STUDY = 'CASE_STUDY',
  CHECKLIST = 'CHECKLIST',
  VIDEO = 'VIDEO',
  WEBINAR = 'WEBINAR',
}

export interface AssistanceRequestDTO {
  id: string;
  title: string;
  description: string;
  type: AssistanceTypeEnum;
  sector: ProjectSectorEnum;
  subsectors: string[];
  priority: AssistancePriorityEnum;
  status: AssistanceStatusEnum;
  budget?: number;
  timeline: {
    requestDate: string;
    expectedStartDate: string;
    duration: number; // in weeks
  };
  requester: {
    name: string;
    organization: string;
    email: string;
  };
  assignedExperts: string[];
  tags: string[];
}

export interface AssistanceExpertDTO {
  id: string;
  name: string;
  title: string;
  organization: string;
  photo?: string;
  expertise: AssistanceTypeEnum[];
  sectors: ProjectSectorEnum[];
  subsectors: string[];
  languages: string[];
  location: {
    country: string;
    city: string;
  };
  rating: number;
  completedAssignments: number;
  hourlyRate?: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  bio: string;
  skills: string[];
}

export interface AssistanceCollaborationDTO {
  id: string;
  requestId: string;
  requestTitle: string;
  expertName: string;
  expertOrganization: string;
  type: AssistanceTypeEnum;
  status: AssistanceStatusEnum;
  startDate: string;
  endDate?: string;
  progress: number; // 0-100
  deliverables: {
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'DELIVERED';
    dueDate: string;
  }[];
  budget: {
    total: number;
    spent: number;
  };
}

export interface AssistanceResourceDTO {
  id: string;
  title: string;
  description: string;
  type: ResourceTypeEnum;
  sector: ProjectSectorEnum;
  subsectors: string[];
  language: 'EN' | 'FR' | 'ES' | 'MULTI';
  fileSize?: string;
  duration?: string; // for videos/webinars
  publishDate: string;
  downloadCount: number;
  rating: number;
  author: string;
  tags: string;
  thumbnail?: string;
  url?: string;
}

export interface AssistanceKPIsDTO {
  activeRequests: number;
  completedRequests: number;
  availableExperts: number;
  ongoingCollaborations: number;
  averageResponseTime: number; // in hours
  satisfactionRate: number; // 0-100
}

// Alias for convenience
export type ExpertDTO = AssistanceExpertDTO;