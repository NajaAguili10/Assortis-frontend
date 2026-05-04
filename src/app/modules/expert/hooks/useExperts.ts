import { useState, useMemo } from 'react';
import {
  ExpertListDTO,
  ExpertProfileDTO,
  CVProfileDTO,
  ExpertMatchingDTO,
  ExpertKPIsDTO,
  ExpertFiltersDTO,
  PaginatedResponseDTO,
  ExpertStatusEnum,
  ExpertLevelEnum,
  ExpertSectorEnum,
  RegionEnum,
  AvailabilityEnum,
  CertificationTypeEnum,
  CertificationDTO,
  WritingExperienceDTO,
} from '../types/expert.dto';
import React from 'react';
import { expertService } from '@/app/services/expertService';

// Extended type pour l'usage interne avec champs additionnels
interface ExpertListDTOInternal extends ExpertListDTO {
  name: string;
  role: string;
  expertise: string;
  availabilityLabel: string;
  rate: string;
}
export interface ExpertSectorDTO {
  sectorName: string;
  sectorCode: string;
}

export interface ExpertSkillDTO {
  skillName: string;
  level: string;
}

export interface ExpertLanguageDTO {
  languageCode: string;
  languageName: string;
  proficiency: string;
}

export interface ExpertEducationDTO {
  id: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  grade: string;
  graduationYear: number;
  country: string;
  city: string;
}

export interface ExpertExperienceDTO {
  id: number;
  title: string;
  organization: string;
  donorName: string;
  sectorName: string;
  startDate: string;
  endDate: string;
  description: string;
  country: string;
  city: string;
  isCurrent: boolean;
}
export interface CountryDTO {
  id: number;
  name: string;
  code: string;
}

export interface CityDTO {
  id: number;
  name: string;
}
export interface ExpertDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  currentPosition: string;
  yearsExperience: number;
  dailyRate: number;
  hourlyRate: number;
  currency: string;
  availabilityStatus: string;
  availabilityPercentage: number;
  profileSummary: string;
  completedMissions: string;
  completedProjects: number;
  ratingAvg: number;
  verificationStatus: string;
  level: string;
  country: CountryDTO;
  city: CityDTO;

  primaryOrganizationName: string;
  organizationId: string;
  isBidWriter: boolean;
  verified: boolean;
  lastActiveAt: string;
  sectors: ExpertSectorDTO[];
  skills: ExpertSkillDTO[];
  languages: ExpertLanguageDTO[];
  educations: ExpertEducationDTO[];
  experiences: ExpertExperienceDTO[];
  certifications: CertificationDTO[];
}
const bidWriterExperienceSamples: Record<string, WritingExperienceDTO> = {
  '7': {
    writingMethodologies: ['TA', 'Grants'],
    writingContributions: ["Reviewing others' contributions", 'Writing methodologies in full', 'Proofreading and editing'],
    writingLanguages: ['English', 'Spanish'],
    comfortableToWriteOn: 'Governance reform, public administration, civil society strengthening, institutional capacity building',
    donorProcurementExperience: 'USAID, World Bank, FCDO, EU PRAG and UN agency proposal procedures',
    writingComments: 'Strong at turning mixed technical inputs into a coherent win theme and compliant methodology.',
    writingExperienceRows: [
      {
        id: 'writer-7-row-1',
        titleOfTenderProject: 'Public Financial Management Reform Facility',
        donor: 'World Bank',
        country: 'Ghana',
        year: '2024',
        indicativePagesWritten: '42',
        result: 'won',
        referencePersonProjectManager: 'Helen Carter',
        additionalInformation: 'Led methodology, staffing narrative, and compliance review.',
      },
      {
        id: 'writer-7-row-2',
        titleOfTenderProject: 'Local Governance Accountability Programme',
        donor: 'FCDO',
        country: 'Kenya',
        year: '2023',
        indicativePagesWritten: '36',
        result: 'won',
        referencePersonProjectManager: 'Omar Lewis',
        additionalInformation: 'Reviewed partner inputs and edited final technical proposal.',
      },
    ],
  },
  '8': {
    writingMethodologies: ['TA', 'FWC'],
    writingContributions: ['Contributing with technical inputs', 'Writing methodologies in full'],
    writingLanguages: ['Spanish', 'English', 'Portuguese'],
    comfortableToWriteOn: 'Infrastructure, agriculture value chains, logistics, regional development and climate-resilient services',
    donorProcurementExperience: 'IDB, CAF, EU FWC, World Bank and national procurement portals',
    writingComments: 'Excellent with tight compliance matrices and converting technical designs into clear tender responses.',
    writingExperienceRows: [
      {
        id: 'writer-8-row-1',
        titleOfTenderProject: 'Rural Roads Climate Resilience Technical Assistance',
        donor: 'IDB',
        country: 'Peru',
        year: '2024',
        indicativePagesWritten: '28',
        result: 'lost',
        referencePersonProjectManager: 'Lucia Moreno',
        additionalInformation: 'Prepared implementation approach and quality assurance sections.',
      },
      {
        id: 'writer-8-row-2',
        titleOfTenderProject: 'Agricultural Market Systems FWC Assignment',
        donor: 'European Union',
        country: 'Colombia',
        year: '2022',
        indicativePagesWritten: '31',
        result: 'won',
        referencePersonProjectManager: 'Mateo Silva',
        additionalInformation: 'Consolidated expert inputs in English and Spanish.',
      },
    ],
  },
  '9': {
    writingMethodologies: ['Grants', 'FWC'],
    writingContributions: ["Reviewing others' contributions", 'Proofreading and editing'],
    writingLanguages: ['English', 'French'],
    comfortableToWriteOn: 'Education, health systems, gender inclusion, NGO grants and donor reporting frameworks',
    donorProcurementExperience: 'UNICEF, Global Affairs Canada, EU grants, Gates Foundation and UNOPS',
    writingComments: 'Particularly strong on grant logic, editorial polish, donor terminology and results frameworks.',
    writingExperienceRows: [
      {
        id: 'writer-9-row-1',
        titleOfTenderProject: 'Inclusive Education Grant Proposal',
        donor: 'UNICEF',
        country: 'Senegal',
        year: '2023',
        indicativePagesWritten: '24',
        result: 'won',
        referencePersonProjectManager: 'Nadia Bell',
        additionalInformation: 'Edited full proposal and rewrote results framework narrative.',
      },
      {
        id: 'writer-9-row-2',
        titleOfTenderProject: 'Primary Health Outreach Programme',
        donor: 'Global Affairs Canada',
        country: 'Rwanda',
        year: '2021',
        indicativePagesWritten: '39',
        result: 'won',
        referencePersonProjectManager: 'Claire Martin',
        additionalInformation: 'Reviewed technical annexes and final proofread.',
      },
    ],
  },
  '10': {
    writingMethodologies: ['TA', 'FWC'],
    writingContributions: ['Contributing with technical inputs', 'Writing methodologies in full', 'Proofreading and editing'],
    writingLanguages: ['English', 'German'],
    comfortableToWriteOn: 'Digital transformation, infrastructure, e-government platforms, data systems and technology-enabled services',
    donorProcurementExperience: 'ADB, KfW, GIZ, World Bank and EU FWC procedures',
    writingComments: 'Combines technical architecture fluency with practical proposal structure and delivery planning.',
    writingExperienceRows: [
      {
        id: 'writer-10-row-1',
        titleOfTenderProject: 'Digital Government Interoperability Platform',
        donor: 'ADB',
        country: 'Indonesia',
        year: '2024',
        indicativePagesWritten: '45',
        result: 'won',
        referencePersonProjectManager: 'Daniel Koh',
        additionalInformation: 'Wrote technical methodology, workplan and risk management approach.',
      },
      {
        id: 'writer-10-row-2',
        titleOfTenderProject: 'Municipal Infrastructure Data Hub',
        donor: 'KfW',
        country: 'Georgia',
        year: '2022',
        indicativePagesWritten: '33',
        result: 'lost',
        referencePersonProjectManager: 'Anna Weber',
        additionalInformation: 'Prepared systems integration narrative and implementation schedule.',
      },
    ],
  },
};

// Mock Data for Experts
/*const mockExperts: ExpertListDTOInternal[] = [
  {
    id: '1',
    organizationId: 'org-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    name: 'Sarah Johnson',
    role: 'Senior Project Manager',
    expertise: 'Project Management Expert',
    availabilityLabel: '80%',
    rate: '$850/day',
    email: 'sarah.johnson@example.com',
    title: 'Senior Project Manager',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'United Kingdom',
    city: 'London',
    region: RegionEnum.EUROPE,
    bio: 'Experienced project manager specializing in international development projects with a focus on infrastructure and governance.',
    yearsOfExperience: 12,
    dailyRate: 850,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.INFRASTRUCTURE, ExpertSectorEnum.GOVERNANCE],
    skills: ['Project Management', 'Stakeholder Engagement', 'M&E', 'Budget Management'],
    languages: [
      { language: 'English', level: 'NATIVE' },
      { language: 'French', level: 'FLUENT' },
    ],
    completedMissions: 34,
    clientRating: 4.8,
    profileCompleteness: 95,
    verified: true,
    lastActive: '2024-02-20T10:30:00Z',
  },
  {
    id: '2',
    organizationId: 'org-1',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    name: 'Ahmed Hassan',
    role: 'Agriculture Development Specialist',
    expertise: 'Agricultural Economics Expert',
    availabilityLabel: '70%',
    rate: '$750/day',
    email: 'ahmed.hassan@example.com',
    title: 'Agriculture Development Specialist',
    status: ExpertStatusEnum.VERIFIED,
    level: ExpertLevelEnum.EXPERT,
    availability: AvailabilityEnum.WITHIN_1_MONTH,
    country: 'Egypt',
    city: 'Cairo',
    region: RegionEnum.AFRICA_NORTH,
    bio: 'Agricultural economist with extensive experience in sustainable farming and rural development across Africa.',
    yearsOfExperience: 15,
    dailyRate: 750,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.AGRICULTURE, ExpertSectorEnum.ENVIRONMENT],
    skills: ['Agricultural Economics', 'Rural Development', 'Sustainable Farming', 'Capacity Building'],
    languages: [
      { language: 'Arabic', level: 'NATIVE' },
      { language: 'English', level: 'FLUENT' },
      { language: 'French', level: 'INTERMEDIATE' },
    ],
    completedMissions: 42,
    clientRating: 4.9,
    profileCompleteness: 100,
    verified: true,
    lastActive: '2024-02-22T14:15:00Z',
  },
  {
    id: '3',
    organizationId: 'org-1',
    firstName: 'Maria',
    lastName: 'Garcia',
    name: 'Maria Garcia',
    role: 'Public Health Advisor',
    expertise: 'Public Health Expert',
    availabilityLabel: '90%',
    rate: '$680/day',
    email: 'maria.garcia@example.com',
    title: 'Public Health Advisor',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'Spain',
    city: 'Madrid',
    region: RegionEnum.EUROPE,
    bio: 'Public health specialist with focus on maternal health, disease prevention, and health systems strengthening.',
    yearsOfExperience: 10,
    dailyRate: 680,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.HEALTH, ExpertSectorEnum.EDUCATION],
    skills: ['Public Health', 'Health Systems', 'Epidemiology', 'Training'],
    languages: [
      { language: 'Spanish', level: 'NATIVE' },
      { language: 'English', level: 'FLUENT' },
      { language: 'Portuguese', level: 'ADVANCED' },
    ],
    completedMissions: 28,
    clientRating: 4.7,
    profileCompleteness: 92,
    verified: true,
    lastActive: '2024-02-23T09:45:00Z',
  },
  {
    id: '4',
    organizationId: 'org-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    name: 'Jean Dupont',
    role: 'Climate Change Consultant',
    expertise: 'Climate Change Expert',
    availabilityLabel: '60%',
    rate: '$950/day',
    email: 'jean.dupont@example.com',
    title: 'Climate Change Consultant',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.LEAD,
    availability: AvailabilityEnum.WITHIN_3_MONTHS,
    country: 'France',
    city: 'Paris',
    region: RegionEnum.EUROPE,
    bio: 'Climate change expert specialized in adaptation strategies and environmental policy for developing countries.',
    yearsOfExperience: 18,
    dailyRate: 950,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.CLIMATE_CHANGE, ExpertSectorEnum.ENVIRONMENT, ExpertSectorEnum.ENERGY],
    skills: ['Climate Adaptation', 'Environmental Policy', 'Carbon Markets', 'GIS'],
    languages: [
      { language: 'French', level: 'NATIVE' },
      { language: 'English', level: 'FLUENT' },
    ],
    completedMissions: 56,
    clientRating: 5.0,
    profileCompleteness: 98,
    verified: true,
    lastActive: '2024-02-24T11:20:00Z',
  },
  {
    id: '5',
    organizationId: 'org-2',
    firstName: 'Amara',
    lastName: 'Ndiaye',
    name: 'Amara Ndiaye',
    role: 'Education Program Manager',
    expertise: 'Education Expert',
    availabilityLabel: '85%',
    rate: '$550/day',
    email: 'amara.ndiaye@example.com',
    title: 'Education Program Manager',
    status: ExpertStatusEnum.VERIFIED,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'Senegal',
    city: 'Dakar',
    region: RegionEnum.AFRICA_WEST,
    bio: 'Education specialist with expertise in curriculum development and teacher training in francophone Africa.',
    yearsOfExperience: 9,
    dailyRate: 550,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.EDUCATION, ExpertSectorEnum.GOVERNANCE],
    skills: ['Curriculum Development', 'Teacher Training', 'Education Policy', 'M&E'],
    languages: [
      { language: 'French', level: 'NATIVE' },
      { language: 'Wolof', level: 'NATIVE' },
      { language: 'English', level: 'ADVANCED' },
    ],
    completedMissions: 22,
    clientRating: 4.6,
    profileCompleteness: 88,
    verified: true,
    lastActive: '2024-02-21T16:00:00Z',
  },
  {
    id: '6',
    organizationId: 'org-1',
    firstName: 'David',
    lastName: 'Ochieng',
    name: 'David Ochieng',
    role: 'Water & Sanitation Engineer',
    expertise: 'Water & Sanitation Expert',
    availabilityLabel: '75%',
    rate: '$480/day',
    email: 'david.ochieng@example.com',
    title: 'Water & Sanitation Engineer',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.INTERMEDIATE,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'Kenya',
    city: 'Nairobi',
    region: RegionEnum.AFRICA_EAST,
    bio: 'Civil engineer specialized in water and sanitation infrastructure projects in rural and peri-urban areas.',
    yearsOfExperience: 7,
    dailyRate: 480,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.WATER_SANITATION, ExpertSectorEnum.INFRASTRUCTURE],
    skills: ['Civil Engineering', 'WASH', 'Project Design', 'Community Engagement'],
    languages: [
      { language: 'English', level: 'NATIVE' },
      { language: 'Swahili', level: 'NATIVE' },
    ],
    completedMissions: 18,
    clientRating: 4.5,
    profileCompleteness: 85,
    verified: false,
    lastActive: '2024-02-23T13:30:00Z',
  },
  {
    id: '7',
    organizationId: 'org-2',
    firstName: 'Margaret',
    lastName: 'Thompson',
    name: 'Margaret Thompson',
    role: 'Bid Writer & Proposal Manager',
    expertise: 'Proposal Writing Expert',
    availabilityLabel: '80%',
    rate: '$600/day',
    email: 'margaret.thompson@example.com',
    title: 'Bid Writer & Proposal Manager',
    status: ExpertStatusEnum.VERIFIED,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'United States',
    city: 'Washington DC',
    region: RegionEnum.NORTH_AMERICA,
    bio: 'Experienced bid writer and proposal manager with expertise in winning competitive tenders and grants for international development projects.',
    yearsOfExperience: 13,
    dailyRate: 600,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.GOVERNANCE, ExpertSectorEnum.INFRASTRUCTURE],
    skills: ['Bid Writing', 'Proposal Development', 'Tender Response', 'Grant Writing', 'Document Management'],
    languages: [
      { language: 'English', level: 'NATIVE' },
      { language: 'Spanish', level: 'ADVANCED' },
    ],
    completedMissions: 67,
    clientRating: 4.9,
    profileCompleteness: 96,
    verified: true,
    lastActive: '2024-02-24T10:00:00Z',
    writingExperience: bidWriterExperienceSamples['7'],
  },
  {
    id: '8',
    organizationId: 'org-1',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    name: 'Carlos Rodriguez',
    role: 'Tender Response Specialist',
    expertise: 'Proposal Writing Expert',
    availabilityLabel: '70%',
    rate: '$520/day',
    email: 'carlos.rodriguez@example.com',
    title: 'Tender Response Specialist',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.INTERMEDIATE,
    availability: AvailabilityEnum.WITHIN_1_MONTH,
    country: 'Colombia',
    city: 'Bogotá',
    region: RegionEnum.SOUTH_AMERICA,
    bio: 'Specialized bid writer focused on writing competitive proposals and tender documents for development and infrastructure projects.',
    yearsOfExperience: 8,
    dailyRate: 520,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.INFRASTRUCTURE, ExpertSectorEnum.AGRICULTURE],
    skills: ['Tender Writing', 'Bid Proposal', 'Technical Writing', 'Compliance Documentation'],
    languages: [
      { language: 'Spanish', level: 'NATIVE' },
      { language: 'English', level: 'FLUENT' },
      { language: 'Portuguese', level: 'INTERMEDIATE' },
    ],
    completedMissions: 41,
    clientRating: 4.7,
    profileCompleteness: 89,
    verified: false,
    lastActive: '2024-02-22T15:45:00Z',
    writingExperience: bidWriterExperienceSamples['8'],
  },
  {
    id: '9',
    organizationId: 'org-2',
    firstName: 'Patricia',
    lastName: 'Williams',
    name: 'Patricia Williams',
    role: 'Grant Writer & Editor',
    expertise: 'Proposal Writing Expert',
    availabilityLabel: '85%',
    rate: '$580/day',
    email: 'patricia.williams@example.com',
    title: 'Grant Writer & Editor',
    status: ExpertStatusEnum.VERIFIED,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'Canada',
    city: 'Toronto',
    region: RegionEnum.NORTH_AMERICA,
    bio: 'Expert grant writer and editor with 11 years of experience writing successful proposals for multilateral donors and international NGOs.',
    yearsOfExperience: 11,
    dailyRate: 580,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.EDUCATION, ExpertSectorEnum.HEALTH],
    skills: ['Grant Writing', 'Proposal Editing', 'Donor Compliance', 'Bid Strategy', 'Technical Writer'],
    languages: [
      { language: 'English', level: 'NATIVE' },
      { language: 'French', level: 'FLUENT' },
    ],
    completedMissions: 58,
    clientRating: 4.8,
    profileCompleteness: 94,
    verified: true,
    lastActive: '2024-02-23T11:30:00Z',
    writingExperience: bidWriterExperienceSamples['9'],
  },
  {
    id: '10',
    organizationId: 'org-1',
    firstName: 'Michael',
    lastName: 'Chen',
    name: 'Michael Chen',
    role: 'Technical Bid Writer',
    expertise: 'Proposal Writing Expert',
    availabilityLabel: '90%',
    rate: '$640/day',
    email: 'michael.chen@example.com',
    title: 'Technical Bid Writer',
    status: ExpertStatusEnum.ACTIVE,
    level: ExpertLevelEnum.SENIOR,
    availability: AvailabilityEnum.IMMEDIATE,
    country: 'Singapore',
    city: 'Singapore',
    region: RegionEnum.ASIA_PACIFIC,
    bio: 'Technical bid writer specializing in complex tender responses for technology and infrastructure projects with proven track record of winning bids.',
    yearsOfExperience: 10,
    dailyRate: 640,
    currency: 'EUR',
    sectors: [ExpertSectorEnum.TECHNOLOGY, ExpertSectorEnum.INFRASTRUCTURE],
    skills: ['Technical Writing', 'Bid Proposal', 'Tender Strategy', 'Project Documentation', 'Writer'],
    languages: [
      { language: 'English', level: 'NATIVE' },
      { language: 'Mandarin', level: 'FLUENT' },
    ],
    completedMissions: 52,
    clientRating: 4.6,
    profileCompleteness: 91,
    verified: true,
    lastActive: '2024-02-24T08:20:00Z',
    writingExperience: bidWriterExperienceSamples['10'],
  },
]; */






export const useExperts = () => {
  const [experts, setExperts] = useState<ExpertDTO[]>([]);
  const [filters, setFilters] = useState<ExpertFiltersDTO>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'experience' | 'availability' | 'name'>('newest');

  React.useEffect(() => {
    const fetchExperts = async () => {
      try {
        const result = await expertService.getAllExperts();
        setExperts(result);
      } catch (error) {
        console.error("Error fetching experts:", error);
      }
    };
    fetchExperts();
  }, []);

  const pageSize = 10;

  // Mock CV Profiles
  const cvProfiles: CVProfileDTO[] = useMemo(() => [
    {
      id: 'cv-1',
      expertId: '1',
      fileName: 'Sarah_Johnson_CV.pdf',
      uploadedDate: '2024-02-15T10:00:00Z',
      status: 'COMPLETED',
      extractedData: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+44 20 1234 5678',
        skills: ['Project Management', 'Stakeholder Engagement', 'M&E'],
        experience: ['12 years in international development'],
        education: ['MSc Development Studies'],
      },
      matchingScore: 92,
    },
    {
      id: 'cv-2',
      expertId: '2',
      fileName: 'Ahmed_Hassan_CV.pdf',
      uploadedDate: '2024-02-18T14:30:00Z',
      status: 'COMPLETED',
      extractedData: {
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        skills: ['Agricultural Economics', 'Rural Development'],
        experience: ['15 years in agriculture sector'],
        education: ['PhD Agricultural Economics'],
      },
      matchingScore: 95,
    },
    {
      id: 'cv-3',
      expertId: '7',
      fileName: 'John_Smith_CV.pdf',
      uploadedDate: '2024-02-24T09:15:00Z',
      status: 'PROCESSING',
    },
  ], []);

  // Mock Matching Results
  const matching: ExpertMatchingDTO[] = useMemo(() => {
    if (experts.length < 3) return [];

    return [
      {
        id: 'match-1',
        expertId: '1',
        expert: experts[0] as any,
        torId: 'tender-1',
        torTitle: 'Senior Infrastructure Project Manager - East Africa',
        matchingScore: 94,
        status: 'PENDING',
        matchedDate: '2024-02-22T10:00:00Z',
        matchingReasons: {
          skills: 95,
          experience: 98,
          sector: 90,
          location: 88,
          availability: 100,
        },
      },
      {
        id: 'match-2',
        expertId: '2',
        expert: experts[1] as any,
        torId: 'tender-2',
        torTitle: 'Agricultural Development Specialist - North Africa',
        matchingScore: 96,
        status: 'INVITED',
        matchedDate: '2024-02-20T14:30:00Z',
        invitationSent: '2024-02-21T09:00:00Z',
        matchingReasons: {
          skills: 97,
          experience: 99,
          sector: 100,
          location: 95,
          availability: 85,
        },
      },
      {
        id: 'match-3',
        expertId: '3',
        expert: experts[2] as any,
        torId: 'tender-3',
        torTitle: 'Public Health Advisor - South America',
        matchingScore: 89,
        status: 'ACCEPTED',
        matchedDate: '2024-02-18T11:15:00Z',
        invitationSent: '2024-02-19T10:00:00Z',
        response: '2024-02-20T15:30:00Z',
        matchingReasons: {
          skills: 92,
          experience: 88,
          sector: 95,
          location: 75,
          availability: 100,
        },
      },
    ];
  }, [experts]);

  // KPIs
  const kpis: ExpertKPIsDTO = {
    totalExperts: 3847,
    availableExperts: 2891,
    certifiedExperts: 1523,
    activeMissions: 342,
    pendingMatches: 18,
    averageMatchingRate: 87,
    cvProcessed: 1456,
    verifiedProfiles: 2184,
  };

  // Filter and sort experts
  const filteredExperts = useMemo(() => {
    let filtered = experts.map(e => ({
      ...e,
      // Mapping for compatibility with existing UI filters/sorting if names differ
      title: e.currentPosition,
      bio: e.profileSummary,
      clientRating: e.ratingAvg,
      yearsOfExperience: e.yearsExperience,
      availability: e.availabilityStatus as any,
      lastActive: e.lastActiveAt,
      name: e.fullName,
    }));

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expert) =>
          expert.firstName.toLowerCase().includes(query) ||
          expert.lastName.toLowerCase().includes(query) ||
          expert.title.toLowerCase().includes(query) ||
          expert.profileSummary.toLowerCase().includes(query) ||
          expert.skills.some((skill) => skill.skillName.toLowerCase().includes(query))
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((expert) => filters.status!.includes(expert.verificationStatus as any));
    }

    if (filters.level && filters.level.length > 0) {
      filtered = filtered.filter((expert) => filters.level!.includes(expert.level as any));
    }

    if (filters.sector && filters.sector.length > 0) {
      filtered = filtered.filter((expert) =>
        expert.sectors.some((sector) => filters.sector!.includes(sector.sectorCode as any))
      );
    }

    if (filters.region && filters.region.length > 0) {
      // Note: backend ExpertDTO doesn't seem to have region field yet, mapping if needed
      // filtered = filtered.filter((expert) => filters.region!.includes(expert.region as any));
    }

    if (filters.availability && filters.availability.length > 0) {
      filtered = filtered.filter((expert) => filters.availability!.includes(expert.availability as any));
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter((expert) => expert.verified === filters.verified);
    }

    if (filters.minExperience !== undefined) {
      filtered = filtered.filter((expert) => expert.yearsOfExperience >= filters.minExperience!);
    }

    if (filters.maxExperience !== undefined) {
      filtered = filtered.filter((expert) => expert.yearsOfExperience <= filters.maxExperience!);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((expert) => expert.clientRating >= filters.minRating!);
    }

    if (filters.minDailyRate !== undefined && filters.maxDailyRate !== undefined) {
      filtered = filtered.filter(
        (expert) =>
          expert.dailyRate !== undefined &&
          expert.dailyRate >= filters.minDailyRate! &&
          expert.dailyRate <= filters.maxDailyRate!
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.clientRating - a.clientRating);
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
        break;
      case 'availability':
        const availabilityOrder: Record<string, number> = {
          'IMMEDIATE': 0,
          'WITHIN_1_MONTH': 1,
          'WITHIN_3_MONTHS': 2,
          'NOT_AVAILABLE': 3,
        };
        filtered.sort(
          (a, b) => (availabilityOrder[a.availability] ?? 99) - (availabilityOrder[b.availability] ?? 99)
        );
        break;
      case 'name':
        filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    }

    return filtered;
  }, [experts, filters, sortBy]);

  // Pagination
  const paginatedExperts: PaginatedResponseDTO<ExpertListDTO> = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const data = filteredExperts.slice(start, end);

    return {
      data,
      meta: {
        page: currentPage,
        pageSize,
        totalItems: filteredExperts.length,
        totalPages: Math.ceil(filteredExperts.length / pageSize),
        hasNextPage: currentPage < Math.ceil(filteredExperts.length / pageSize),
        hasPreviousPage: currentPage > 1,
      },
    };
  }, [filteredExperts, currentPage]);

  // Filter management
  const updateFilters = (newFilters: Partial<ExpertFiltersDTO>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    if (filters.level && filters.level.length > 0) count += filters.level.length;
    if (filters.sector && filters.sector.length > 0) count += filters.sector.length;
    if (filters.region && filters.region.length > 0) count += filters.region.length;
    if (filters.availability && filters.availability.length > 0) count += filters.availability.length;
    if (filters.verified !== undefined) count += 1;
    if (filters.minExperience !== undefined || filters.maxExperience !== undefined) count += 1;
    if (filters.minRating !== undefined) count += 1;
    if (filters.minDailyRate !== undefined || filters.maxDailyRate !== undefined) count += 1;
    return count;
  }, [filters]);

  return {
    experts: paginatedExperts,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    cvProfiles: cvProfiles,
    matching: matching,
    allExperts: experts, // For global search
  };
};
