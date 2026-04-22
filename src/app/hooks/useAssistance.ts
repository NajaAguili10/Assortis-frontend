import { useState, useMemo } from 'react';
import {
  AssistanceRequestDTO,
  AssistanceExpertDTO,
  AssistanceCollaborationDTO,
  AssistanceResourceDTO,
  AssistanceKPIsDTO,
  AssistanceTypeEnum,
  AssistanceStatusEnum,
  AssistancePriorityEnum,
  ResourceTypeEnum,
} from '../types/assistance.dto';
import { ProjectSectorEnum } from '../types/project.dto';

// Mock Data
const mockRequests: AssistanceRequestDTO[] = [
  {
    id: 'REQ-001',
    title: 'Strategic Planning Support for Education Reform',
    description: 'Need expert assistance in developing a 5-year strategic plan for national education reform',
    type: AssistanceTypeEnum.STRATEGIC,
    sector: ProjectSectorEnum.EDUCATION,
    subsectors: ['PRIMARY_EDUCATION', 'SECONDARY_EDUCATION'],
    priority: AssistancePriorityEnum.HIGH,
    status: AssistanceStatusEnum.IN_PROGRESS,
    budget: 50000,
    timeline: {
      requestDate: '2024-01-15',
      expectedStartDate: '2024-02-01',
      duration: 12,
    },
    requester: {
      name: 'Marie Dubois',
      organization: 'Ministry of Education',
      email: 'marie.dubois@moe.gov',
    },
    assignedExperts: ['Dr. John Smith', 'Prof. Sarah Johnson'],
    tags: ['Strategic Planning', 'Education Reform', 'Policy Development'],
  },
  {
    id: 'REQ-002',
    title: 'Technical Assistance for Water Infrastructure Project',
    description: 'Seeking technical expertise in water treatment plant design and implementation',
    type: AssistanceTypeEnum.TECHNICAL,
    sector: ProjectSectorEnum.WATER_SANITATION,
    subsectors: ['WATER_SUPPLY', 'WASTEWATER'],
    priority: AssistancePriorityEnum.URGENT,
    status: AssistanceStatusEnum.PENDING,
    budget: 75000,
    timeline: {
      requestDate: '2024-02-10',
      expectedStartDate: '2024-03-01',
      duration: 16,
    },
    requester: {
      name: 'Ahmed Hassan',
      organization: 'National Water Authority',
      email: 'ahmed.hassan@nwa.gov',
    },
    assignedExperts: [],
    tags: ['Water Infrastructure', 'Engineering', 'Project Management'],
  },
  {
    id: 'REQ-003',
    title: 'Financial Management Capacity Building',
    description: 'Support needed for strengthening financial management systems in healthcare facilities',
    type: AssistanceTypeEnum.FINANCIAL,
    sector: ProjectSectorEnum.HEALTH,
    subsectors: ['PRIMARY_HEALTHCARE', 'HOSPITALS'],
    priority: AssistancePriorityEnum.MEDIUM,
    status: AssistanceStatusEnum.COMPLETED,
    budget: 35000,
    timeline: {
      requestDate: '2023-11-20',
      expectedStartDate: '2023-12-01',
      duration: 8,
    },
    requester: {
      name: 'Dr. Fatima Al-Rashid',
      organization: 'Regional Health Directorate',
      email: 'fatima.alrashid@health.gov',
    },
    assignedExperts: ['Michael Chen', 'Laura Martinez'],
    tags: ['Financial Management', 'Healthcare', 'Capacity Building'],
  },
];

const mockExperts: AssistanceExpertDTO[] = [
  {
    id: 'EXP-001',
    name: 'Dr. John Smith',
    title: 'Senior Education Policy Advisor',
    organization: 'Global Education Consulting',
    expertise: [AssistanceTypeEnum.STRATEGIC, AssistanceTypeEnum.TECHNICAL],
    sectors: [ProjectSectorEnum.EDUCATION],
    subsectors: ['PRIMARY_EDUCATION', 'SECONDARY_EDUCATION', 'HIGHER_EDUCATION'],
    languages: ['English', 'French', 'Spanish'],
    location: {
      country: 'United States',
      city: 'Washington DC',
    },
    rating: 4.8,
    completedAssignments: 47,
    hourlyRate: 250,
    availability: 'AVAILABLE',
    bio: 'Over 20 years of experience in education policy and reform. Led major education transformation projects in 15+ countries.',
    skills: ['Policy Development', 'Strategic Planning', 'Stakeholder Engagement', 'M&E'],
  },
  {
    id: 'EXP-002',
    name: 'Prof. Sarah Johnson',
    title: 'Water & Sanitation Specialist',
    organization: 'International Water Institute',
    expertise: [AssistanceTypeEnum.TECHNICAL, AssistanceTypeEnum.OPERATIONAL],
    sectors: [ProjectSectorEnum.WATER_SANITATION, ProjectSectorEnum.INFRASTRUCTURE],
    subsectors: ['WATER_SUPPLY', 'SANITATION', 'WASTEWATER'],
    languages: ['English', 'French'],
    location: {
      country: 'United Kingdom',
      city: 'London',
    },
    rating: 4.9,
    completedAssignments: 63,
    hourlyRate: 300,
    availability: 'BUSY',
    bio: 'Expert in water infrastructure design and implementation. Published author on sustainable water management.',
    skills: ['Water Treatment', 'Infrastructure Design', 'Project Management', 'Sustainability'],
  },
  {
    id: 'EXP-003',
    name: 'Michael Chen',
    title: 'Financial Management Consultant',
    organization: 'Chen & Associates',
    expertise: [AssistanceTypeEnum.FINANCIAL, AssistanceTypeEnum.STRATEGIC],
    sectors: [ProjectSectorEnum.HEALTH, ProjectSectorEnum.GOVERNANCE],
    subsectors: ['PRIMARY_HEALTHCARE', 'HOSPITALS', 'PUBLIC_ADMINISTRATION'],
    languages: ['English', 'Mandarin'],
    location: {
      country: 'Singapore',
      city: 'Singapore',
    },
    rating: 4.7,
    completedAssignments: 38,
    hourlyRate: 200,
    availability: 'AVAILABLE',
    bio: 'Specialized in healthcare financial management and public sector financial systems. MBA from Harvard Business School.',
    skills: ['Financial Analysis', 'Budget Management', 'Cost Optimization', 'Financial Reporting'],
  },
  {
    id: 'EXP-004',
    name: 'Laura Martinez',
    title: 'Legal & Compliance Advisor',
    organization: 'Martinez Law Firm',
    expertise: [AssistanceTypeEnum.LEGAL, AssistanceTypeEnum.STRATEGIC],
    sectors: [ProjectSectorEnum.GOVERNANCE, ProjectSectorEnum.HUMAN_RIGHTS],
    subsectors: ['PUBLIC_ADMINISTRATION', 'TRANSPARENCY', 'CIVIL_RIGHTS'],
    languages: ['Spanish', 'English', 'Portuguese'],
    location: {
      country: 'Spain',
      city: 'Madrid',
    },
    rating: 4.6,
    completedAssignments: 29,
    hourlyRate: 275,
    availability: 'AVAILABLE',
    bio: 'International law expert with focus on governance and human rights. Former UN legal advisor.',
    skills: ['Legal Compliance', 'Policy Review', 'Regulatory Frameworks', 'International Law'],
  },
];

const mockCollaborations: AssistanceCollaborationDTO[] = [
  {
    id: 'COL-001',
    requestId: 'REQ-001',
    requestTitle: 'Strategic Planning Support for Education Reform',
    expertName: 'Dr. John Smith',
    expertOrganization: 'Global Education Consulting',
    type: AssistanceTypeEnum.STRATEGIC,
    status: AssistanceStatusEnum.IN_PROGRESS,
    startDate: '2024-02-01',
    progress: 65,
    deliverables: [
      { title: 'Situation Analysis Report', status: 'DELIVERED', dueDate: '2024-03-01' },
      { title: 'Strategic Framework Draft', status: 'IN_PROGRESS', dueDate: '2024-04-15' },
      { title: 'Implementation Roadmap', status: 'PENDING', dueDate: '2024-05-30' },
    ],
    budget: {
      total: 50000,
      spent: 32500,
    },
  },
  {
    id: 'COL-002',
    requestId: 'REQ-003',
    requestTitle: 'Financial Management Capacity Building',
    expertName: 'Michael Chen',
    expertOrganization: 'Chen & Associates',
    type: AssistanceTypeEnum.FINANCIAL,
    status: AssistanceStatusEnum.COMPLETED,
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    progress: 100,
    deliverables: [
      { title: 'Current Systems Assessment', status: 'DELIVERED', dueDate: '2023-12-15' },
      { title: 'Financial Management Manual', status: 'DELIVERED', dueDate: '2024-01-10' },
      { title: 'Training Program Delivery', status: 'DELIVERED', dueDate: '2024-01-31' },
    ],
    budget: {
      total: 35000,
      spent: 35000,
    },
  },
];

const mockResources: AssistanceResourceDTO[] = [
  {
    id: 'RES-001',
    title: 'Project Management Toolkit for Development Projects',
    description: 'Comprehensive toolkit including templates, checklists, and best practices for managing development projects',
    type: ResourceTypeEnum.TOOLKIT,
    sector: ProjectSectorEnum.GOVERNANCE,
    subsectors: ['PUBLIC_ADMINISTRATION'],
    language: 'MULTI',
    fileSize: '15 MB',
    publishDate: '2024-01-15',
    downloadCount: 342,
    rating: 4.7,
    author: 'International Development Institute',
    tags: ['Project Management', 'Templates', 'Best Practices'],
  },
  {
    id: 'RES-002',
    title: 'Education Sector Strategic Planning Guide',
    description: 'Step-by-step guide for developing education sector strategic plans with practical examples',
    type: ResourceTypeEnum.GUIDE,
    sector: ProjectSectorEnum.EDUCATION,
    subsectors: ['PRIMARY_EDUCATION', 'SECONDARY_EDUCATION'],
    language: 'EN',
    fileSize: '8 MB',
    publishDate: '2024-02-10',
    downloadCount: 198,
    rating: 4.8,
    author: 'Global Education Partnership',
    tags: ['Strategic Planning', 'Education', 'Policy Development'],
  },
  {
    id: 'RES-003',
    title: 'Water Infrastructure Design Standards',
    description: 'Technical standards and guidelines for designing water supply and sanitation infrastructure',
    type: ResourceTypeEnum.TEMPLATE,
    sector: ProjectSectorEnum.WATER_SANITATION,
    subsectors: ['WATER_SUPPLY', 'SANITATION'],
    language: 'EN',
    fileSize: '12 MB',
    publishDate: '2023-12-05',
    downloadCount: 267,
    rating: 4.9,
    author: 'World Water Council',
    tags: ['Water Infrastructure', 'Engineering', 'Standards'],
  },
  {
    id: 'RES-004',
    title: 'Healthcare Financial Management Case Study',
    description: 'Real-world case study on implementing financial management systems in regional hospitals',
    type: ResourceTypeEnum.CASE_STUDY,
    sector: ProjectSectorEnum.HEALTH,
    subsectors: ['HOSPITALS', 'PRIMARY_HEALTHCARE'],
    language: 'EN',
    fileSize: '5 MB',
    publishDate: '2024-01-20',
    downloadCount: 156,
    rating: 4.6,
    author: 'Health Systems Consulting',
    tags: ['Healthcare', 'Financial Management', 'Case Study'],
  },
  {
    id: 'RES-005',
    title: 'Community Engagement Webinar Series',
    description: 'Recorded webinar series on effective community engagement strategies for development projects',
    type: ResourceTypeEnum.WEBINAR,
    sector: ProjectSectorEnum.GOVERNANCE,
    subsectors: ['PUBLIC_ADMINISTRATION'],
    language: 'EN',
    duration: '3h 45min',
    publishDate: '2024-02-01',
    downloadCount: 428,
    rating: 4.8,
    author: 'Community Development Network',
    tags: ['Community Engagement', 'Webinar', 'Best Practices'],
  },
];

const mockKPIs: AssistanceKPIsDTO = {
  activeRequests: 12,
  completedRequests: 47,
  availableExperts: 156,
  ongoingCollaborations: 8,
  averageResponseTime: 24,
  satisfactionRate: 92,
};

interface AssistanceFilters {
  type?: AssistanceTypeEnum[];
  sector?: ProjectSectorEnum[];
  subsector?: string[];
  status?: AssistanceStatusEnum[];
  priority?: AssistancePriorityEnum[];
  availability?: ('AVAILABLE' | 'BUSY' | 'UNAVAILABLE')[];
  language?: string[];
  resourceType?: ResourceTypeEnum[];
  searchQuery?: string;
}

export function useAssistance() {
  const [filters, setFilters] = useState<AssistanceFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredRequests = useMemo(() => {
    return mockRequests.filter((request) => {
      if (filters.type && filters.type.length > 0 && !filters.type.includes(request.type)) return false;
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(request.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && !request.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.status && filters.status.length > 0 && !filters.status.includes(request.status)) return false;
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(request.priority)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          request.title.toLowerCase().includes(query) ||
          request.description.toLowerCase().includes(query) ||
          request.requester.organization.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [filters]);

  const filteredExperts = useMemo(() => {
    return mockExperts.filter((expert) => {
      if (filters.type && filters.type.length > 0 && !expert.expertise.some(e => filters.type!.includes(e))) return false;
      if (filters.sector && filters.sector.length > 0 && !expert.sectors.some(s => filters.sector!.includes(s))) return false;
      if (filters.subsector && filters.subsector.length > 0 && !expert.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.availability && filters.availability.length > 0 && !filters.availability.includes(expert.availability)) return false;
      if (filters.language && filters.language.length > 0 && !expert.languages.some(l => filters.language!.includes(l))) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          expert.name.toLowerCase().includes(query) ||
          expert.title.toLowerCase().includes(query) ||
          expert.organization.toLowerCase().includes(query) ||
          expert.skills.some(s => s.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filters]);

  const filteredResources = useMemo(() => {
    return mockResources.filter((resource) => {
      if (filters.resourceType && filters.resourceType.length > 0 && !filters.resourceType.includes(resource.type)) return false;
      if (filters.sector && filters.sector.length > 0 && !filters.sector.includes(resource.sector)) return false;
      if (filters.subsector && filters.subsector.length > 0 && !resource.subsectors.some(s => filters.subsector!.includes(s))) return false;
      if (filters.language && filters.language.length > 0 && !filters.language.includes(resource.language)) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.author.toLowerCase().includes(query) ||
          resource.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [filters]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, currentPage]);

  const paginatedExperts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredExperts.slice(start, end);
  }, [filteredExperts, currentPage]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredResources.slice(start, end);
  }, [filteredResources, currentPage]);

  const updateFilters = (newFilters: Partial<AssistanceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')).length;

  return {
    requests: paginatedRequests,
    experts: paginatedExperts,
    collaborations: mockCollaborations,
    resources: paginatedResources,
    kpis: mockKPIs,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    currentPage,
    setCurrentPage,
    totalRequests: filteredRequests.length,
    totalExperts: filteredExperts.length,
    totalResources: filteredResources.length,
    // All unfiltered data for global search
    allRequests: mockRequests,
    allExperts: mockExperts,
    allResources: mockResources,
    allAssistance: [...mockRequests.map(r => ({ 
      id: r.id, 
      title: r.title, 
      description: r.description, 
      category: r.type 
    })), ...mockResources.map(r => ({ 
      id: r.id, 
      title: r.title, 
      description: r.description, 
      category: r.type 
    }))],
  };
}