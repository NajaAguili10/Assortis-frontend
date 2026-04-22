import { useState, useMemo, useCallback } from 'react';
import {
  TrainingCourseDTO,
  TrainingProgramDTO,
  TrainingSessionDTO,
  TrainingTrainerDTO,
  TrainingCertificationDTO,
  TrainingKPIsDTO,
  TrainingLevelEnum,
  TrainingFormatEnum,
  TrainingStatusEnum,
  SessionStatusEnum,
  CertificationStatusEnum,
} from '../types/training.dto';
import { ProjectSectorEnum } from '../types/project.dto';

// Mock Data
const mockCourses: TrainingCourseDTO[] = [
  {
    id: 'CRS-001',
    title: 'Advanced Project Management for Development',
    description: 'Master project management methodologies tailored for international development projects',
    sector: ProjectSectorEnum.GOVERNANCE,
    subsectors: ['PROJECT_MANAGEMENT'],
    level: TrainingLevelEnum.ADVANCED,
    format: TrainingFormatEnum.ONLINE,
    duration: 40,
    language: 'EN',
    instructor: {
      name: 'Dr. Sarah Johnson',
      title: 'Senior Project Management Expert',
      courses: 12,
      students: 2456,
      rating: 4.9,
    },
    price: 1200,
    rating: 4.8,
    enrolledCount: 342,
    startDate: '2024-03-15',
    endDate: '2024-05-15',
    modules: 8,
    certificate: true,
    certificationAvailable: true,
    certificationPrice: 350,
    certificationTitle: 'Certified Development Project Manager',
    certificationIssuer: 'International Development Institute',
    certificationValidityMonths: 36,
    tags: ['Project Management', 'Development', 'Leadership'],
  },
  {
    id: 'CRS-002',
    title: 'Sustainable Agriculture Practices',
    description: 'Learn modern sustainable farming techniques and agricultural innovation',
    sector: ProjectSectorEnum.AGRICULTURE,
    subsectors: ['SUSTAINABLE_FARMING', 'AGRICULTURAL_ECONOMICS'],
    level: TrainingLevelEnum.INTERMEDIATE,
    format: TrainingFormatEnum.HYBRID,
    duration: 30,
    language: 'MULTI',
    instructor: {
      name: 'Prof. Michael Chen',
      title: 'Agricultural Systems Specialist',
      courses: 8,
      students: 1892,
      rating: 4.8,
    },
    price: 950,
    rating: 4.9,
    enrolledCount: 278,
    startDate: '2024-04-01',
    modules: 6,
    certificate: true,
    certificationAvailable: true,
    certificationPrice: 250,
    certificationTitle: 'Certified Sustainable Agriculture Specialist',
    certificationIssuer: 'Global Agriculture Network',
    certificationValidityMonths: 24,
    tags: ['Agriculture', 'Sustainability', 'Innovation'],
  },
  {
    id: 'CRS-003',
    title: 'Climate Change Adaptation Strategies',
    description: 'Develop expertise in climate adaptation planning and implementation',
    sector: ProjectSectorEnum.ENVIRONMENT,
    subsectors: ['CLIMATE_ADAPTATION', 'ENVIRONMENTAL_MANAGEMENT'],
    level: TrainingLevelEnum.ADVANCED,
    format: TrainingFormatEnum.ONLINE,
    duration: 35,
    language: 'EN',
    instructor: {
      name: 'Dr. Emma Williams',
      title: 'Climate Change Expert',
      courses: 10,
      students: 2134,
      rating: 4.9,
    },
    price: 1100,
    rating: 4.7,
    enrolledCount: 195,
    startDate: '2024-03-20',
    modules: 7,
    certificate: true,
    tags: ['Climate Change', 'Adaptation', 'Environment'],
  },
  {
    id: 'CRS-004',
    title: 'Gender Mainstreaming in Development',
    description: 'Integrate gender perspectives into development programs and policies',
    sector: ProjectSectorEnum.GENDER,
    subsectors: ['GENDER_MAINSTREAMING', 'GENDER_ANALYSIS'],
    level: TrainingLevelEnum.INTERMEDIATE,
    format: TrainingFormatEnum.SELF_PACED,
    duration: 20,
    language: 'MULTI',
    instructor: {
      name: 'Laura Martinez',
      title: 'Gender Equality Specialist',
      courses: 6,
      students: 1543,
      rating: 4.7,
    },
    price: 750,
    rating: 4.8,
    enrolledCount: 412,
    modules: 5,
    certificate: true,
    tags: ['Gender', 'Mainstreaming', 'Policy'],
  },
];

const mockPrograms: TrainingProgramDTO[] = [
  {
    id: 'PRG-001',
    courseId: 'CRS-001',
    courseTitle: 'Advanced Project Management for Development',
    enrollmentDate: '2024-02-01',
    status: TrainingStatusEnum.ONGOING,
    progress: 65,
    completedModules: 5,
    totalModules: 8,
    lastAccessDate: '2024-02-20',
    certificateEarned: false,
    nextSession: {
      date: '2024-02-25',
      topic: 'Risk Management in Development Projects',
    },
    instructor: {
      name: 'Dr. Sarah Johnson',
    },
  },
  {
    id: 'PRG-002',
    courseId: 'CRS-004',
    courseTitle: 'Gender Mainstreaming in Development',
    enrollmentDate: '2024-01-15',
    status: TrainingStatusEnum.COMPLETED,
    progress: 100,
    completedModules: 5,
    totalModules: 5,
    lastAccessDate: '2024-02-10',
    certificateEarned: true,
    certificateDate: '2024-02-10',
    instructor: {
      name: 'Laura Martinez',
    },
  },
];

const mockSessions: TrainingSessionDTO[] = [
  {
    id: 'SES-001',
    courseId: 'CRS-001',
    courseTitle: 'Advanced Project Management for Development',
    topic: 'Stakeholder Engagement Best Practices',
    description: 'Learn effective strategies for engaging stakeholders in development projects',
    instructor: {
      name: 'Dr. Sarah Johnson',
      title: 'Senior Project Management Expert',
    },
    date: '2024-02-28T14:00:00Z',
    duration: 90,
    status: SessionStatusEnum.SCHEDULED,
    registeredCount: 45,
    maxCapacity: 60,
    language: 'EN',
  },
  {
    id: 'SES-002',
    courseId: 'CRS-002',
    courseTitle: 'Sustainable Agriculture Practices',
    topic: 'Organic Farming Techniques',
    description: 'Deep dive into modern organic farming methodologies',
    instructor: {
      name: 'Prof. Michael Chen',
      title: 'Agricultural Systems Specialist',
    },
    date: '2024-03-05T10:00:00Z',
    duration: 120,
    status: SessionStatusEnum.SCHEDULED,
    registeredCount: 38,
    maxCapacity: 50,
    language: 'EN',
  },
  {
    id: 'SES-003',
    courseId: 'CRS-003',
    courseTitle: 'Climate Change Adaptation Strategies',
    topic: 'Community-Based Adaptation Planning',
    description: 'Practical approaches to community-level climate adaptation',
    instructor: {
      name: 'Dr. Emma Williams',
      title: 'Climate Change Expert',
    },
    date: '2024-02-22T16:00:00Z',
    duration: 90,
    status: SessionStatusEnum.ENDED,
    registeredCount: 52,
    maxCapacity: 60,
    language: 'EN',
    recordingUrl: 'https://example.com/recording/ses-003',
  },
];

const mockTrainers: TrainingTrainerDTO[] = [
  {
    id: 'TRN-001',
    name: 'Dr. Sarah Johnson',
    title: 'Senior Project Management Expert',
    organization: 'Global Development Institute',
    bio: 'Over 20 years of experience in project management and organizational development. Led capacity building programs in 30+ countries.',
    expertise: ['Project Management', 'Leadership', 'Strategic Planning'],
    sectors: [ProjectSectorEnum.GOVERNANCE, ProjectSectorEnum.INFRASTRUCTURE],
    subsectors: ['PROJECT_MANAGEMENT', 'GOVERNANCE_REFORM'],
    languages: ['English', 'French', 'Spanish'],
    rating: 4.9,
    coursesCount: 12,
    studentsCount: 2456,
    yearsExperience: 22,
    certifications: ['PMP', 'Prince2', 'Agile Scrum Master'],
  },
  {
    id: 'TRN-002',
    name: 'Prof. Michael Chen',
    title: 'Agricultural Systems Specialist',
    organization: 'International Agriculture Research Center',
    bio: 'Leading expert in sustainable agriculture and food security. Published author with focus on climate-smart agriculture.',
    expertise: ['Sustainable Agriculture', 'Food Security', 'Climate Adaptation'],
    sectors: [ProjectSectorEnum.AGRICULTURE, ProjectSectorEnum.ENVIRONMENT],
    subsectors: ['SUSTAINABLE_FARMING', 'AGRICULTURAL_ECONOMICS'],
    languages: ['English', 'Mandarin'],
    rating: 4.8,
    coursesCount: 8,
    studentsCount: 1892,
    yearsExperience: 18,
    certifications: ['PhD Agriculture', 'Sustainable Farming Certified'],
  },
  {
    id: 'TRN-003',
    name: 'Dr. Emma Williams',
    title: 'Climate Change Expert',
    organization: 'Climate Action Network',
    bio: 'Climate scientist and policy advisor with expertise in adaptation and mitigation strategies. Former IPCC contributor.',
    expertise: ['Climate Change', 'Environmental Policy', 'Adaptation Planning'],
    sectors: [ProjectSectorEnum.ENVIRONMENT, ProjectSectorEnum.GOVERNANCE],
    subsectors: ['CLIMATE_ADAPTATION', 'ENVIRONMENTAL_MANAGEMENT'],
    languages: ['English', 'German'],
    rating: 4.9,
    coursesCount: 10,
    studentsCount: 2134,
    yearsExperience: 16,
    certifications: ['PhD Environmental Science', 'IPCC Lead Author'],
  },
];

const mockCertifications: TrainingCertificationDTO[] = [
  {
    id: 'CERT-001',
    title: 'Certified Project Manager in Development',
    description: 'Professional certification in managing development and humanitarian projects',
    sector: ProjectSectorEnum.GOVERNANCE,
    subsectors: ['PROJECT_MANAGEMENT'],
    level: TrainingLevelEnum.ADVANCED,
    issuer: 'Global Development Institute',
    validityPeriod: 36,
    requirements: ['Complete PM course', 'Pass exam (70%)', '2 years experience'],
    passingScore: 70,
    status: CertificationStatusEnum.IN_PROGRESS,
    price: 500,
    examDuration: 180,
    attempts: 2,
  },
  {
    id: 'CERT-002',
    title: 'Gender Mainstreaming Specialist',
    description: 'Expert certification in gender equality and mainstreaming practices',
    sector: ProjectSectorEnum.GENDER,
    subsectors: ['GENDER_MAINSTREAMING', 'GENDER_ANALYSIS'],
    level: TrainingLevelEnum.INTERMEDIATE,
    issuer: 'International Gender Institute',
    validityPeriod: 24,
    requirements: ['Complete Gender course', 'Pass exam (75%)'],
    passingScore: 75,
    status: CertificationStatusEnum.PASSED,
    earnedDate: '2024-02-10',
    expiryDate: '2026-02-10',
    credentialId: 'GMS-2024-001234',
    price: 350,
    examDuration: 120,
    attempts: 1,
  },
  {
    id: 'CERT-003',
    title: 'Climate Adaptation Professional',
    description: 'Certification in climate change adaptation planning and implementation',
    sector: ProjectSectorEnum.ENVIRONMENT,
    subsectors: ['CLIMATE_ADAPTATION'],
    level: TrainingLevelEnum.ADVANCED,
    issuer: 'Climate Action Certification Board',
    validityPeriod: 0,
    requirements: ['Complete Climate course', 'Pass exam (80%)', 'Capstone project'],
    passingScore: 80,
    status: CertificationStatusEnum.NOT_STARTED,
    price: 600,
    examDuration: 240,
    attempts: 3,
  },
];

const mockKPIs: TrainingKPIsDTO = {
  enrolledPrograms: 2,
  completedPrograms: 1,
  upcomingSessions: 5,
  earnedCertifications: 1,
  totalLearningHours: 45,
  averageProgress: 65,
};

interface TrainingFilters {
  level?: TrainingLevelEnum[];
  format?: TrainingFormatEnum[];
  sector?: ProjectSectorEnum[];
  subsector?: string[];
  status?: TrainingStatusEnum[];
  sessionStatus?: SessionStatusEnum[];
  language?: string[];
  certificationAvailable?: boolean;
  searchQuery?: string;
}

export function useTraining() {
  const [filters, setFilters] = useState<TrainingFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      if (filters.level && filters.level.length > 0 && !filters.level.includes(course.level)) return false;
      if (filters.format && filters.format.length > 0 && !filters.format.includes(course.format)) return false;
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(course.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && !course.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.language && filters.language.length > 0 && !filters.language.includes(course.language)) return false;
      if (filters.certificationAvailable !== undefined && course.certificationAvailable !== filters.certificationAvailable) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructor.name.toLowerCase().includes(query) ||
          course.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filters]);

  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter((program) => {
      if (filters.status && filters.status.length > 0 && !filters.status.includes(program.status)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return program.courseTitle.toLowerCase().includes(query) || program.instructor.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [filters]);

  const filteredSessions = useMemo(() => {
    return mockSessions.filter((session) => {
      if (filters.sessionStatus && filters.sessionStatus.length > 0 && !filters.sessionStatus.includes(session.status)) return false;
      if (filters.language && filters.language.length > 0 && !filters.language.includes(session.language)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          session.courseTitle.toLowerCase().includes(query) ||
          session.topic.toLowerCase().includes(query) ||
          session.instructor.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [filters]);

  const filteredTrainers = useMemo(() => {
    return mockTrainers.filter((trainer) => {
      if (filters.sector && filters.sector.length > 0 && !trainer.sectors.some(s => filters.sector!.includes(s))) return false;
      if (filters.subsector && filters.subsector.length > 0 && !trainer.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          trainer.name.toLowerCase().includes(query) ||
          trainer.title.toLowerCase().includes(query) ||
          trainer.organization.toLowerCase().includes(query) ||
          trainer.expertise.some(e => e.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filters]);

  const filteredCertifications = useMemo(() => {
    return mockCertifications.filter((cert) => {
      if (filters.level && filters.level.length > 0 && !filters.level.includes(cert.level)) return false;
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(cert.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && !cert.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return cert.title.toLowerCase().includes(query) || cert.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [filters]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredCourses.slice(start, end);
  }, [filteredCourses, currentPage]);

  const updateFilters = useCallback((newFilters: Partial<TrainingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')).length;

  return {
    courses: paginatedCourses,
    allCourses: mockCourses,
    programs: filteredPrograms,
    enrolledCourses: filteredPrograms,
    sessions: filteredSessions,
    trainers: filteredTrainers,
    certifications: filteredCertifications,
    kpis: mockKPIs,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    currentPage,
    setCurrentPage,
    totalCourses: filteredCourses.length,
    totalPrograms: filteredPrograms.length,
    totalSessions: filteredSessions.length,
    totalTrainers: filteredTrainers.length,
    totalCertifications: filteredCertifications.length,
  };
}