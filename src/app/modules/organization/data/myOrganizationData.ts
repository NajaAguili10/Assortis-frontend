// Centralized data for the current user's organization
// This ensures consistency between MyOrganization and OrganizationsEditProfile pages

export const myOrganizationData = {
  // Basic Information
  name: 'Global Development Partners',
  acronym: 'GDP',
  type: 'ngo',
  legalName: 'Global Development Partners International',
  registrationNumber: 'NGO-2010-BE-12345',
  yearEstablished: 2010,
  established: '2010',
  description: 'International development organization focused on sustainable development and capacity building in emerging markets.',
  
  // Contact & Location
  email: 'contact@gdp-international.org',
  phone: '+1 (555) 123-4567',
  website: 'https://www.gdp-international.org',
  address: '123 Development Avenue',
  city: 'Brussels',
  country: 'Belgium',
  postalCode: '1000',
  region: 'EUROPE',
  timezone: 'CET (UTC+1)',
  
  // Operations & Expertise
  operatingRegions: ['EUROPE', 'AFRICA'],
  sectors: ['EDUCATION', 'HEALTH', 'INFRASTRUCTURE'],
  selectedSector: 'EDUCATION',
  subsectors: ['PRIMARY_EDUCATION', 'TEACHER_TRAINING'],
  services: ['Technical Assistance', 'Project Management', 'Capacity Building'],
  languages: ['English', 'French', 'Spanish', 'Arabic'],
  
  // Team & Resources
  teamSize: 187,
  employees: '150-200',
  experts: 45,
  technicalCapacity: 'High',
  equipment: 'Fully equipped offices in 12 countries, mobile units, IT infrastructure',
  
  // Financial & Projects
  annualBudget: 8500000,
  budget: '$5M - $10M',
  totalBudget: '$125M',
  projectsCompleted: 156,
  activeProjects: 24,
  successRate: '94%',
  
  // Certifications & Partnerships
  certifications: ['ISO 9001', 'UN Procurement Certified', 'EU Donor Certified'],
  partnerships: ['UN Agencies', 'World Bank', 'EU Commission'],
  
  // Services
  selectedServices: ['Technical Assistance', 'Project Management'],
  
  // Status
  status: 'VERIFIED',
};
