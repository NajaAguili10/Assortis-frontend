/**
 * Job Offer Service
 * Mock service for managing job offers (to be replaced with real API)
 */

import { 
  JobOfferListDTO, 
  JobOfferDetailDTO, 
  JobOfferCreateDTO,
  JobOfferTypeEnum,
  JobOfferStatusEnum 
} from '../types/JobOffer.dto';

/**
 * Mock data for job offers
 */
const mockJobOffers: JobOfferDetailDTO[] = [
  {
    id: 'job-1',
    jobTitle: 'Senior Project Manager',
    location: 'Nairobi, Kenya',
    projectTitle: 'East Africa Water Access Initiative',
    type: JobOfferTypeEnum.PROJECT,
    duration: '12 months',
    description: 'We are seeking an experienced Senior Project Manager to lead our water access initiative in East Africa. The successful candidate will oversee project implementation, manage stakeholder relationships, and ensure delivery of project outcomes.',
    publishedAt: '2026-02-20',
    deadline: '2026-03-15',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 15,
    organizationName: 'WaterAid International',
    recruiterId: 'rec-001',
    requirements: [
      'Minimum 7 years of project management experience',
      'Experience in international development sector',
      'Strong leadership and communication skills',
      'Fluency in English (French is a plus)'
    ],
    responsibilities: [
      'Lead project planning and execution',
      'Manage project budget and resources',
      'Coordinate with local partners and stakeholders',
      'Report on project progress and outcomes'
    ],
    qualifications: [
      'Master\'s degree in relevant field',
      'PMP certification preferred',
      'Experience in East Africa region',
      'Proven track record in WASH sector'
    ],
    benefits: [
      'Competitive salary package',
      'Health insurance',
      'Housing allowance',
      'Professional development opportunities'
    ],
    salary: {
      min: 60000,
      max: 80000,
      currency: 'USD'
    },
    contactEmail: 'recruitment@wateraid.org',
    contactPerson: 'Sarah Johnson',
    totalApplications: 24,
    createdAt: '2026-02-20',
    updatedAt: '2026-02-20'
  },
  {
    id: 'job-2',
    jobTitle: 'Education Program Coordinator',
    location: 'Dakar, Senegal',
    projectTitle: 'West Africa Education Quality Program',
    type: JobOfferTypeEnum.PROJECT,
    duration: '18 months',
    description: 'Looking for a dynamic Education Program Coordinator to support our education quality program in West Africa. The role involves coordinating activities across multiple countries and working with local education ministries.',
    publishedAt: '2026-02-15',
    deadline: '2026-03-10',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 10,
    organizationName: 'UNESCO',
    recruiterId: 'rec-002',
    requirements: [
      'Minimum 5 years in education program management',
      'Experience working with government agencies',
      'Fluency in French and English',
      'Strong analytical and reporting skills'
    ],
    responsibilities: [
      'Coordinate program activities across countries',
      'Support capacity building initiatives',
      'Monitor and evaluate program outcomes',
      'Prepare technical reports'
    ],
    qualifications: [
      'Master\'s degree in Education or related field',
      'Experience in West Africa',
      'Knowledge of education systems',
      'Strong intercultural communication skills'
    ],
    salary: {
      min: 50000,
      max: 65000,
      currency: 'USD'
    },
    contactEmail: 'hr@unesco.org',
    totalApplications: 18,
    createdAt: '2026-02-15',
    updatedAt: '2026-02-15'
  },
  {
    id: 'job-3',
    jobTitle: 'Finance Manager',
    location: 'Brussels, Belgium',
    department: 'Finance & Administration',
    type: JobOfferTypeEnum.INTERNAL,
    duration: 'Permanent',
    description: 'We are recruiting a Finance Manager to join our headquarters team in Brussels. This is a permanent position responsible for financial planning, reporting, and compliance across our European operations.',
    publishedAt: '2026-02-25',
    deadline: '2026-03-25',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 25,
    organizationName: 'Oxfam International',
    recruiterId: 'rec-003',
    requirements: [
      'Qualified accountant (CPA, ACCA, or equivalent)',
      'Minimum 8 years finance management experience',
      'Experience with international organizations',
      'Proficiency in financial software'
    ],
    responsibilities: [
      'Oversee financial planning and budgeting',
      'Ensure compliance with financial regulations',
      'Manage finance team',
      'Prepare financial reports for Board'
    ],
    qualifications: [
      'Professional accounting qualification',
      'Experience in non-profit sector',
      'Strong leadership skills',
      'Fluency in English and French'
    ],
    benefits: [
      'Competitive salary and benefits',
      'Pension plan',
      'Professional development budget',
      'Flexible working arrangements'
    ],
    salary: {
      min: 70000,
      max: 90000,
      currency: 'EUR'
    },
    contactEmail: 'careers@oxfam.org',
    totalApplications: 31,
    createdAt: '2026-02-25',
    updatedAt: '2026-02-25'
  },
  {
    id: 'job-4',
    jobTitle: 'Health Systems Specialist',
    location: 'Kampala, Uganda',
    projectTitle: 'Maternal and Child Health Initiative',
    type: JobOfferTypeEnum.PROJECT,
    duration: '24 months',
    description: 'Seeking a Health Systems Specialist to strengthen health systems for maternal and child health in Uganda. The role involves working with Ministry of Health and district health teams.',
    publishedAt: '2026-02-18',
    deadline: '2026-03-08',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 8,
    organizationName: 'UNICEF',
    recruiterId: 'rec-004',
    requirements: [
      'Medical or public health degree',
      'Minimum 6 years experience in health systems strengthening',
      'Experience in East Africa',
      'Strong technical and advisory skills'
    ],
    responsibilities: [
      'Provide technical support to health facilities',
      'Develop capacity building programs',
      'Monitor health system performance',
      'Coordinate with government partners'
    ],
    qualifications: [
      'Master\'s in Public Health or related field',
      'Experience with MNCH programs',
      'Knowledge of health information systems',
      'Excellent communication skills'
    ],
    salary: {
      min: 55000,
      max: 70000,
      currency: 'USD'
    },
    contactEmail: 'recruit@unicef.org',
    totalApplications: 22,
    createdAt: '2026-02-18',
    updatedAt: '2026-02-18'
  },
  {
    id: 'job-5',
    jobTitle: 'Communications Officer',
    location: 'Paris, France',
    department: 'Communications & Advocacy',
    type: JobOfferTypeEnum.INTERNAL,
    duration: '2 years (renewable)',
    description: 'Join our communications team as a Communications Officer. You will be responsible for developing and implementing communication strategies to enhance our visibility and impact.',
    publishedAt: '2026-02-22',
    deadline: '2026-03-22',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 22,
    organizationName: 'Médecins Sans Frontières',
    recruiterId: 'rec-005',
    requirements: [
      'Degree in Communications, Journalism or related field',
      'Minimum 4 years communications experience',
      'Excellent writing and editing skills',
      'Experience with digital communications'
    ],
    responsibilities: [
      'Develop communication materials',
      'Manage social media channels',
      'Coordinate with media',
      'Support advocacy campaigns'
    ],
    qualifications: [
      'Strong storytelling abilities',
      'Proficiency in French and English',
      'Experience in humanitarian sector',
      'Creative and proactive approach'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Professional development',
      'International work environment'
    ],
    salary: {
      min: 40000,
      max: 50000,
      currency: 'EUR'
    },
    contactEmail: 'hr@msf.org',
    totalApplications: 45,
    createdAt: '2026-02-22',
    updatedAt: '2026-02-22'
  },
  {
    id: 'job-6',
    jobTitle: 'Monitoring & Evaluation Specialist',
    location: 'Addis Ababa, Ethiopia',
    projectTitle: 'Food Security and Livelihoods Program',
    type: JobOfferTypeEnum.PROJECT,
    duration: '15 months',
    description: 'We need a skilled M&E Specialist to design and implement monitoring and evaluation systems for our food security and livelihoods program in the Horn of Africa.',
    publishedAt: '2026-02-10',
    deadline: '2026-03-05',
    status: JobOfferStatusEnum.PUBLISHED,
    daysRemaining: 5,
    organizationName: 'World Food Programme',
    recruiterId: 'rec-006',
    requirements: [
      'Advanced degree in M&E or related field',
      'Minimum 5 years M&E experience',
      'Experience with food security programs',
      'Strong data analysis skills'
    ],
    responsibilities: [
      'Design M&E framework',
      'Conduct data quality assessments',
      'Build capacity of local teams',
      'Prepare evaluation reports'
    ],
    qualifications: [
      'Expertise in quantitative and qualitative methods',
      'Experience with data visualization tools',
      'Knowledge of food security indicators',
      'Fluency in English'
    ],
    salary: {
      min: 52000,
      max: 68000,
      currency: 'USD'
    },
    contactEmail: 'jobs@wfp.org',
    totalApplications: 19,
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10'
  }
];

/**
 * Get all job offers
 */
export async function getAllJobOffers(): Promise<JobOfferListDTO[]> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockJobOffers);
    }, 300);
  });
}

/**
 * Get job offers by type
 */
export async function getJobOffersByType(type: JobOfferTypeEnum): Promise<JobOfferListDTO[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockJobOffers.filter(job => job.type === type);
      resolve(filtered);
    }, 300);
  });
}

/**
 * Get job offer by ID
 */
export async function getJobOfferById(id: string): Promise<JobOfferDetailDTO | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const job = mockJobOffers.find(j => j.id === id) || null;
      resolve(job);
    }, 300);
  });
}

/**
 * Get job offers by recruiter ID
 */
export async function getJobOffersByRecruiter(recruiterId: string): Promise<JobOfferListDTO[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockJobOffers.filter(job => job.recruiterId === recruiterId);
      
      // If no jobs found for this recruiter, add demo data
      if (filtered.length === 0) {
        const demoJobs: JobOfferDetailDTO[] = [
          {
            id: `demo-${recruiterId}-1`,
            jobTitle: 'Senior Water & Sanitation Engineer',
            location: 'Kigali, Rwanda',
            projectTitle: 'Rwanda Clean Water Infrastructure Project',
            type: JobOfferTypeEnum.PROJECT,
            duration: '18 months',
            description: 'Lead the design and implementation of water and sanitation infrastructure projects in rural Rwanda. The role involves technical oversight, team management, and stakeholder engagement with local communities and government partners.',
            publishedAt: '2026-03-08',
            deadline: '2026-04-15',
            status: JobOfferStatusEnum.PUBLISHED,
            daysRemaining: 36,
            organizationName: 'UNICEF Rwanda',
            recruiterId,
            applicationsCount: 0,
            totalApplications: 0,
            requirements: 'Civil engineering degree, 7+ years WASH experience, fluency in English/French',
            createdAt: '2026-03-08',
            updatedAt: '2026-03-08'
          },
          {
            id: `demo-${recruiterId}-2`,
            jobTitle: 'Gender & Inclusion Specialist',
            location: 'Bamako, Mali',
            projectTitle: "Women's Economic Empowerment Program",
            type: JobOfferTypeEnum.PROJECT,
            duration: '24 months',
            description: 'Design and implement gender-responsive strategies for women\'s economic empowerment across 5 regions in Mali. Work with local women\'s groups, microfinance institutions, and government agencies to promote inclusive economic development.',
            publishedAt: '2026-03-05',
            deadline: '2026-04-10',
            status: JobOfferStatusEnum.PUBLISHED,
            daysRemaining: 31,
            organizationName: 'UN Women Mali',
            recruiterId,
            applicationsCount: 0,
            totalApplications: 0,
            requirements: 'Masters in Gender Studies/Development, 5+ years experience, fluency in French',
            createdAt: '2026-03-05',
            updatedAt: '2026-03-05'
          },
          {
            id: `demo-${recruiterId}-3`,
            jobTitle: 'Climate Resilience Advisor',
            location: 'Niamey, Niger',
            projectTitle: 'Sahel Climate Adaptation Initiative',
            type: JobOfferTypeEnum.PROJECT,
            duration: '36 months',
            description: 'Provide technical leadership on climate resilience and adaptation strategies for agricultural communities in the Sahel. Develop climate-smart agriculture interventions and build capacity of local partners on climate risk management.',
            publishedAt: '2026-03-02',
            deadline: '2026-03-28',
            status: JobOfferStatusEnum.PUBLISHED,
            daysRemaining: 18,
            organizationName: 'FAO Sahel',
            recruiterId,
            applicationsCount: 0,
            totalApplications: 0,
            requirements: 'PhD/Masters in Climate Science/Agriculture, 8+ years experience in climate adaptation',
            createdAt: '2026-03-02',
            updatedAt: '2026-03-02'
          },
          {
            id: `demo-${recruiterId}-4`,
            jobTitle: 'Digital Health Systems Manager',
            location: 'Abidjan, Côte d\'Ivoire',
            department: 'Health Systems Strengthening',
            type: JobOfferTypeEnum.INTERNAL,
            duration: 'Permanent',
            description: 'Manage the implementation and scale-up of digital health information systems across West Africa. Lead a team of technical specialists and coordinate with Ministries of Health to strengthen health data systems and digital health infrastructure.',
            publishedAt: '2026-02-28',
            deadline: '2026-03-25',
            status: JobOfferStatusEnum.PUBLISHED,
            daysRemaining: 15,
            organizationName: 'WHO AFRO',
            recruiterId,
            applicationsCount: 0,
            totalApplications: 0,
            requirements: 'Masters in Health Informatics/Public Health, 6+ years managing health IT systems',
            createdAt: '2026-02-28',
            updatedAt: '2026-02-28'
          },
          {
            id: `demo-${recruiterId}-5`,
            jobTitle: 'Education Quality Specialist',
            location: 'Kinshasa, DRC',
            projectTitle: 'DRC Primary Education Quality Improvement',
            type: JobOfferTypeEnum.PROJECT,
            duration: '30 months',
            description: 'Support the Ministry of Education to improve teaching quality and learning outcomes in primary schools across 10 provinces. Develop teacher training programs, learning materials, and assessment tools to enhance education quality.',
            publishedAt: '2026-02-25',
            deadline: '2026-03-20',
            status: JobOfferStatusEnum.PUBLISHED,
            daysRemaining: 10,
            organizationName: 'World Bank Education',
            recruiterId,
            applicationsCount: 0,
            totalApplications: 0,
            requirements: 'Masters in Education, 7+ years curriculum development, fluency in French',
            createdAt: '2026-02-25',
            updatedAt: '2026-02-25'
          }
        ];
        
        // Add demo jobs to mock data
        mockJobOffers.push(...demoJobs);
        filtered = demoJobs;
      }
      
      resolve(filtered);
    }, 300);
  });
}

/**
 * Create a new job offer
 */
export async function createJobOffer(data: JobOfferCreateDTO, recruiterId: string): Promise<JobOfferDetailDTO> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newJob: JobOfferDetailDTO = {
        id: `job-${Date.now()}`,
        ...data,
        status: JobOfferStatusEnum.PUBLISHED,
        publishedAt: new Date().toISOString().split('T')[0],
        daysRemaining: Math.ceil((new Date(data.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        recruiterId,
        totalApplications: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockJobOffers.push(newJob);
      resolve(newJob);
    }, 500);
  });
}

/**
 * Update a job offer
 */
export async function updateJobOffer(id: string, data: Partial<JobOfferCreateDTO>): Promise<JobOfferDetailDTO | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockJobOffers.findIndex(j => j.id === id);
      if (index !== -1) {
        mockJobOffers[index] = {
          ...mockJobOffers[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        resolve(mockJobOffers[index]);
      } else {
        resolve(null);
      }
    }, 500);
  });
}

/**
 * Update job offer status
 */
export async function updateJobOfferStatus(id: string, status: JobOfferStatusEnum): Promise<JobOfferDetailDTO | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockJobOffers.findIndex(j => j.id === id);
      if (index !== -1) {
        mockJobOffers[index] = {
          ...mockJobOffers[index],
          status,
          updatedAt: new Date().toISOString()
        };
        resolve(mockJobOffers[index]);
      } else {
        resolve(null);
      }
    }, 500);
  });
}

/**
 * Delete a job offer
 */
export async function deleteJobOffer(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockJobOffers.findIndex(j => j.id === id);
      if (index !== -1) {
        mockJobOffers.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
}

/**
 * Get statistics for recruiter dashboard
 */
export async function getRecruiterStats(recruiterId: string): Promise<{
  totalOffers: number;
  activeOffers: number;
  totalApplications: number;
  closingSoon: number;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const recruiterJobs = mockJobOffers.filter(job => job.recruiterId === recruiterId);
      const stats = {
        totalOffers: recruiterJobs.length,
        activeOffers: recruiterJobs.filter(job => job.status === JobOfferStatusEnum.PUBLISHED).length,
        totalApplications: recruiterJobs.reduce((sum, job) => sum + (job.totalApplications || 0), 0),
        closingSoon: recruiterJobs.filter(job => job.daysRemaining <= 7 && job.status === JobOfferStatusEnum.PUBLISHED).length
      };
      resolve(stats);
    }, 300);
  });
}