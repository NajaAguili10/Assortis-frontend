/**
 * Expert Data Service
 * Simulates database storage for expert profiles created via "Create Account"
 */

export interface ExpertExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ExpertEducation {
  id: string;
  degree: string;
  institution: string;
  field: string;
  year: string;
}

export interface ExpertLanguage {
  id: string;
  name: string;
  level: string;
}

export interface ExpertCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
}

export interface ExpertProfile {
  id: string;
  profilePhoto: string | null;
  cvFile: File | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  title: string;
  level: string;
  yearsExperience: string;
  sectors: string[];
  subsectors: string[];
  skills: string[];
  availability: string;
  availableFrom: string;
  dailyRate: string;
  currency: string;
  experiences: ExpertExperience[];
  education: ExpertEducation[];
  languages: ExpertLanguage[];
  certifications: ExpertCertification[];
  rating?: number;
  completedProjects?: number;
  createdAt: string;
}

// In-memory storage (simulates database)
// In a real app, this would be replaced with API calls to a backend
let expertsDatabase: ExpertProfile[] = [];

// Current user CV storage (simulates user's CV in database)
let currentUserCV: ExpertProfile | null = null;

// Initialize with demo data for demonstration
const initializeDemoData = () => {
  if (expertsDatabase.length === 0) {
    expertsDatabase = [
      {
        id: '1',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 's.mitchell@email.com',
        phone: '+41 22 123 4567',
        location: 'Geneva, Switzerland',
        bio: 'Experienced international development consultant with 15+ years working on large-scale development projects across Africa, Asia, and Latin America.',
        title: 'International Development Consultant',
        level: 'SENIOR',
        yearsExperience: '15+',
        sectors: ['INFRASTRUCTURE', 'HEALTH'],
        subsectors: ['Water and Sanitation', 'Public Health'],
        skills: ['Project Management', 'M&E', 'Strategic Planning', 'Capacity Building', 'Stakeholder Engagement'],
        availability: 'AVAILABLE',
        availableFrom: '2024-04-01',
        dailyRate: '800',
        currency: 'USD',
        experiences: [
          {
            id: 'exp1',
            title: 'Senior Development Consultant',
            company: 'World Bank Group',
            location: 'Washington DC, USA',
            startDate: '2015-01',
            endDate: '',
            current: true,
            description: 'Lead consultant on infrastructure development projects in Sub-Saharan Africa',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'PhD',
            institution: 'London School of Economics',
            field: 'Development Economics',
            year: '2008',
          },
        ],
        languages: [
          { id: 'lang1', name: 'English', level: 'Native' },
          { id: 'lang2', name: 'French', level: 'Fluent' },
          { id: 'lang3', name: 'Spanish', level: 'Intermediate' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'PMP - Project Management Professional',
            issuer: 'PMI',
            date: '2012-06',
            expiryDate: '2025-06',
          },
        ],
        rating: 4.9,
        completedProjects: 47,
        createdAt: new Date('2020-01-15').toISOString(),
      },
      {
        id: '2',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Jean-Pierre',
        lastName: 'Dubois',
        email: 'jp.dubois@email.com',
        phone: '+33 1 45 67 89 00',
        location: 'Paris, France',
        bio: 'Water and sanitation specialist with extensive experience in WASH programs and infrastructure development in developing countries.',
        title: 'Water & Sanitation Specialist',
        level: 'SENIOR',
        yearsExperience: '12+',
        sectors: ['INFRASTRUCTURE', 'ENVIRONMENT'],
        subsectors: ['Water and Sanitation', 'Environmental Protection'],
        skills: ['WASH', 'Infrastructure', 'Community Engagement', 'Technical Design', 'Project Evaluation'],
        availability: 'AVAILABLE',
        availableFrom: '2024-05-01',
        dailyRate: '750',
        currency: 'EUR',
        experiences: [
          {
            id: 'exp1',
            title: 'WASH Team Leader',
            company: 'GIZ',
            location: 'Various Locations',
            startDate: '2012-03',
            endDate: '',
            current: true,
            description: 'Leading WASH programs across West Africa',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'MSc',
            institution: 'École des Ponts ParisTech',
            field: 'Environmental Engineering',
            year: '2011',
          },
        ],
        languages: [
          { id: 'lang1', name: 'French', level: 'Native' },
          { id: 'lang2', name: 'English', level: 'Fluent' },
          { id: 'lang3', name: 'Arabic', level: 'Intermediate' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'PE License',
            issuer: 'Professional Engineers',
            date: '2013-09',
            expiryDate: '',
          },
        ],
        rating: 4.8,
        completedProjects: 34,
        createdAt: new Date('2019-06-20').toISOString(),
      },
      {
        id: '3',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Maria',
        lastName: 'García Rodriguez',
        email: 'm.garcia@email.com',
        phone: '+34 91 234 5678',
        location: 'Madrid, Spain',
        bio: 'Gender and social inclusion expert specializing in mainstreaming gender equality in development programs and policy advocacy.',
        title: 'Gender & Social Inclusion Expert',
        level: 'SENIOR',
        yearsExperience: '10+',
        sectors: ['EDUCATION', 'GOVERNANCE'],
        subsectors: ['Gender Equality', 'Social Protection'],
        skills: ['Gender Analysis', 'Policy Advocacy', 'Training & Facilitation', 'Research', 'Program Design'],
        availability: 'PARTIALLY_AVAILABLE',
        availableFrom: '2024-08-01',
        dailyRate: '650',
        currency: 'EUR',
        experiences: [
          {
            id: 'exp1',
            title: 'Gender Specialist',
            company: 'UN Women',
            location: 'Latin America',
            startDate: '2014-02',
            endDate: '',
            current: true,
            description: 'Leading gender mainstreaming initiatives across Latin American programs',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'MA',
            institution: 'Universidad Complutense de Madrid',
            field: 'Gender Studies & Development',
            year: '2013',
          },
        ],
        languages: [
          { id: 'lang1', name: 'Spanish', level: 'Native' },
          { id: 'lang2', name: 'English', level: 'Fluent' },
          { id: 'lang3', name: 'Portuguese', level: 'Intermediate' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'Gender Mainstreaming Certification',
            issuer: 'UN Women',
            date: '2015-03',
            expiryDate: '',
          },
        ],
        rating: 4.9,
        completedProjects: 29,
        createdAt: new Date('2018-11-10').toISOString(),
      },
      {
        id: '4',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Ahmed',
        lastName: 'Hassan',
        email: 'a.hassan@email.com',
        phone: '+20 2 1234 5678',
        location: 'Cairo, Egypt',
        bio: 'Public health specialist with extensive experience in epidemiology, health systems strengthening, and emergency response programs.',
        title: 'Public Health Specialist',
        level: 'EXPERT',
        yearsExperience: '18+',
        sectors: ['HEALTH'],
        subsectors: ['Public Health', 'Disease Prevention'],
        skills: ['Epidemiology', 'Health Systems', 'Maternal Health', 'Vaccination Programs', 'Emergency Response'],
        availability: 'AVAILABLE',
        availableFrom: '2024-03-15',
        dailyRate: '900',
        currency: 'USD',
        experiences: [
          {
            id: 'exp1',
            title: 'Regional Health Advisor',
            company: 'WHO',
            location: 'Cairo, Egypt',
            startDate: '2010-01',
            endDate: '',
            current: true,
            description: 'Coordinating health programs across EMRO region',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'MD, MPH',
            institution: 'Cairo University',
            field: 'Medicine and Public Health',
            year: '2005',
          },
        ],
        languages: [
          { id: 'lang1', name: 'Arabic', level: 'Native' },
          { id: 'lang2', name: 'English', level: 'Fluent' },
          { id: 'lang3', name: 'French', level: 'Intermediate' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'WHO Field Epidemiology',
            issuer: 'World Health Organization',
            date: '2008-05',
            expiryDate: '',
          },
        ],
        rating: 5.0,
        completedProjects: 52,
        createdAt: new Date('2017-03-05').toISOString(),
      },
      {
        id: '5',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Linda',
        lastName: 'Kowalski',
        email: 'l.kowalski@email.com',
        phone: '+49 30 1234 5678',
        location: 'Berlin, Germany',
        bio: 'Climate change and environment consultant specializing in climate adaptation strategies, renewable energy, and environmental policy.',
        title: 'Climate Change & Environment Consultant',
        level: 'SENIOR',
        yearsExperience: '14+',
        sectors: ['ENVIRONMENT', 'ENERGY'],
        subsectors: ['Climate Change', 'Renewable Energy'],
        skills: ['Climate Adaptation', 'GHG Inventory', 'Renewable Energy', 'Policy Analysis', 'Environmental Impact Assessment'],
        availability: 'NOT_AVAILABLE',
        availableFrom: '2024-10-01',
        dailyRate: '850',
        currency: 'EUR',
        experiences: [
          {
            id: 'exp1',
            title: 'Climate Advisor',
            company: 'European Commission',
            location: 'Brussels, Belgium',
            startDate: '2013-06',
            endDate: '',
            current: true,
            description: 'Advising on EU climate policies and adaptation strategies',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'PhD',
            institution: 'Technical University of Berlin',
            field: 'Environmental Science',
            year: '2009',
          },
        ],
        languages: [
          { id: 'lang1', name: 'German', level: 'Native' },
          { id: 'lang2', name: 'English', level: 'Fluent' },
          { id: 'lang3', name: 'French', level: 'Intermediate' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'GHG Protocol Certified Professional',
            issuer: 'GHG Protocol',
            date: '2014-08',
            expiryDate: '',
          },
        ],
        rating: 4.7,
        completedProjects: 41,
        createdAt: new Date('2018-07-22').toISOString(),
      },
      {
        id: '6',
        profilePhoto: null,
        cvFile: null,
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'r.kumar@email.com',
        phone: '+91 11 2345 6789',
        location: 'New Delhi, India',
        bio: 'Agriculture and rural development specialist with expertise in value chain development, farmer training, and agribusiness.',
        title: 'Agriculture & Rural Development Specialist',
        level: 'SENIOR',
        yearsExperience: '16+',
        sectors: ['AGRICULTURE'],
        subsectors: ['Agricultural Development', 'Rural Development'],
        skills: ['Value Chain Development', 'Farmer Training', 'Market Systems', 'Agribusiness', 'Rural Finance'],
        availability: 'AVAILABLE',
        availableFrom: '2024-04-15',
        dailyRate: '700',
        currency: 'USD',
        experiences: [
          {
            id: 'exp1',
            title: 'Agriculture Program Manager',
            company: 'FAO',
            location: 'South Asia',
            startDate: '2011-09',
            endDate: '',
            current: true,
            description: 'Managing agricultural development programs across South Asia',
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'MSc',
            institution: 'Indian Agricultural Research Institute',
            field: 'Agricultural Economics',
            year: '2007',
          },
        ],
        languages: [
          { id: 'lang1', name: 'English', level: 'Fluent' },
          { id: 'lang2', name: 'Hindi', level: 'Native' },
          { id: 'lang3', name: 'French', level: 'Basic' },
        ],
        certifications: [
          {
            id: 'cert1',
            name: 'FAO Value Chain Expert',
            issuer: 'FAO',
            date: '2012-11',
            expiryDate: '',
          },
        ],
        rating: 4.8,
        completedProjects: 38,
        createdAt: new Date('2017-09-14').toISOString(),
      },
    ];
  }
};

// Initialize demo data
initializeDemoData();

export const expertsDataService = {
  /**
   * Get all expert profiles
   */
  getAllExperts: (): ExpertProfile[] => {
    initializeDemoData();
    return [...expertsDatabase];
  },

  /**
   * Get expert by ID
   */
  getExpertById: (id: string): ExpertProfile | undefined => {
    return expertsDatabase.find((expert) => expert.id === id);
  },

  /**
   * Create new expert profile
   */
  createExpert: (expertData: Omit<ExpertProfile, 'id' | 'createdAt' | 'rating' | 'completedProjects'>): ExpertProfile => {
    const newExpert: ExpertProfile = {
      ...expertData,
      id: Date.now().toString(),
      rating: 0,
      completedProjects: 0,
      createdAt: new Date().toISOString(),
    };
    expertsDatabase.push(newExpert);
    return newExpert;
  },

  /**
   * Update expert profile
   */
  updateExpert: (id: string, updates: Partial<ExpertProfile>): ExpertProfile | undefined => {
    const index = expertsDatabase.findIndex((expert) => expert.id === id);
    if (index !== -1) {
      expertsDatabase[index] = { ...expertsDatabase[index], ...updates };
      return expertsDatabase[index];
    }
    return undefined;
  },

  /**
   * Delete expert profile
   */
  deleteExpert: (id: string): boolean => {
    const index = expertsDatabase.findIndex((expert) => expert.id === id);
    if (index !== -1) {
      expertsDatabase.splice(index, 1);
      return true;
    }
    return false;
  },

  /**
   * Search experts by criteria
   */
  searchExperts: (criteria: {
    query?: string;
    availability?: string;
    sectors?: string[];
    skills?: string[];
  }): ExpertProfile[] => {
    let results = [...expertsDatabase];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(
        (expert) =>
          expert.firstName.toLowerCase().includes(query) ||
          expert.lastName.toLowerCase().includes(query) ||
          expert.title.toLowerCase().includes(query) ||
          expert.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (criteria.availability && criteria.availability !== 'all') {
      results = results.filter((expert) => expert.availability === criteria.availability);
    }

    if (criteria.sectors && criteria.sectors.length > 0) {
      results = results.filter((expert) =>
        criteria.sectors!.some((sector) => expert.sectors.includes(sector))
      );
    }

    if (criteria.skills && criteria.skills.length > 0) {
      results = results.filter((expert) =>
        criteria.skills!.some((skill) => expert.skills.includes(skill))
      );
    }

    return results;
  },

  /**
   * Get current user's CV
   */
  getCurrentUserCV: (): ExpertProfile | null => {
    return currentUserCV;
  },

  /**
   * Create current user's CV
   */
  createCurrentUserCV: (cvData: Omit<ExpertProfile, 'id' | 'createdAt' | 'rating' | 'completedProjects'>): ExpertProfile => {
    const newCV: ExpertProfile = {
      ...cvData,
      id: 'current-user',
      rating: 0,
      completedProjects: 0,
      createdAt: new Date().toISOString(),
    };
    currentUserCV = newCV;
    return newCV;
  },

  /**
   * Update current user's CV
   */
  updateCurrentUserCV: (updates: Partial<ExpertProfile>): ExpertProfile | null => {
    if (currentUserCV) {
      currentUserCV = { ...currentUserCV, ...updates };
      return currentUserCV;
    }
    return null;
  },

  /**
   * Delete current user's CV
   */
  deleteCurrentUserCV: (): boolean => {
    if (currentUserCV) {
      currentUserCV = null;
      return true;
    }
    return false;
  },
};
