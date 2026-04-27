import { useState, useEffect } from 'react';
import {
  Organization,
  OrganizationKPIs,
  OrganizationFilters,
  PaginatedOrganizations,
  OrganizationTypeEnum,
  OrganizationSectorEnum,
  OrganizationStatusEnum,
  RegionEnum,
} from '@app/types/organization.dto';
import { SubSectorEnum } from '@app/types/tender.dto';
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@app/config/organization-sectors.config';

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'World Health Organization',
    acronym: 'WHO',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.HEALTH],
    subSectors: [SubSectorEnum.PRIMARY_HEALTHCARE, SubSectorEnum.INFECTIOUS_DISEASES, SubSectorEnum.MATERNAL_HEALTH],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Switzerland',
    city: 'Geneva',
    description: 'The World Health Organization is a specialized agency of the United Nations responsible for international public health.',
    email: 'contact@who.int',
    website: 'https://www.who.int',
    yearEstablished: 1948,
    employeeCount: 7000,
    activeProjects: 142,
    completedProjects: 856,
    partnerships: 234,
    certifications: ['ISO 9001', 'UN Verified'],
    budget: {
      amount: 2400000000,
      currency: 'USD',
      formatted: '$2.4B',
    },
    teamMembers: 7000,
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '2',
    name: 'United Nations Development Programme',
    acronym: 'UNDP',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.GOVERNANCE, OrganizationSectorEnum.ENVIRONMENT],
    subSectors: [SubSectorEnum.PUBLIC_ADMINISTRATION, SubSectorEnum.CLIMATE_CHANGE, SubSectorEnum.CONSERVATION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.NORTH_AMERICA,
    country: 'United States',
    city: 'New York',
    description: 'UNDP works in about 170 countries and territories, helping to achieve the eradication of poverty.',
    email: 'info@undp.org',
    website: 'https://www.undp.org',
    yearEstablished: 1965,
    employeeCount: 5000,
    activeProjects: 218,
    completedProjects: 1240,
    partnerships: 456,
    certifications: ['ISO 14001', 'UN Verified'],
    budget: {
      amount: 5100000000,
      currency: 'USD',
      formatted: '$5.1B',
    },
    teamMembers: 5000,
    createdAt: new Date('2019-03-10'),
    updatedAt: new Date('2024-02-18'),
  },
  {
    id: '3',
    name: 'Médecins Sans Frontières',
    acronym: 'MSF',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.HEALTH, OrganizationSectorEnum.HUMANITARIAN],
    subSectors: [SubSectorEnum.PRIMARY_HEALTHCARE, SubSectorEnum.INFECTIOUS_DISEASES, SubSectorEnum.NUTRITION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Switzerland',
    city: 'Geneva',
    description: 'International humanitarian medical NGO providing emergency medical assistance in conflict zones and disasters.',
    email: 'contact@msf.org',
    website: 'https://www.msf.org',
    yearEstablished: 1971,
    employeeCount: 45000,
    activeProjects: 312,
    completedProjects: 2400,
    partnerships: 178,
    certifications: ['ISO 9001', 'Humanitarian Accountability'],
    budget: {
      amount: 1700000000,
      currency: 'USD',
      formatted: '$1.7B',
    },
    teamMembers: 45000,
    createdAt: new Date('2018-05-20'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '4',
    name: 'Oxfam International',
    acronym: 'Oxfam',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.HUMANITARIAN, OrganizationSectorEnum.EDUCATION],
    subSectors: [SubSectorEnum.HUMANITARIAN_AID, SubSectorEnum.DISASTER_RELIEF, SubSectorEnum.PRIMARY_EDUCATION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'United Kingdom',
    city: 'Oxford',
    description: 'Global organization working to end poverty and injustice through advocacy and development programs.',
    email: 'info@oxfam.org',
    website: 'https://www.oxfam.org',
    yearEstablished: 1942,
    employeeCount: 5000,
    activeProjects: 456,
    completedProjects: 3200,
    partnerships: 290,
    certifications: ['ISO 26000', 'Accountability'],
    budget: {
      amount: 1100000000,
      currency: 'USD',
      formatted: '$1.1B',
    },
    teamMembers: 5000,
    createdAt: new Date('2017-08-12'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'African Development Bank',
    acronym: 'AfDB',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.FINANCE, OrganizationSectorEnum.INFRASTRUCTURE],
    subSectors: [SubSectorEnum.ROADS, SubSectorEnum.BRIDGES, SubSectorEnum.TELECOMMUNICATIONS],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.AFRICA,
    country: 'Ivory Coast',
    city: 'Abidjan',
    description: 'Regional multilateral development bank engaged in promoting economic and social development in Africa.',
    email: 'contact@afdb.org',
    website: 'https://www.afdb.org',
    yearEstablished: 1964,
    employeeCount: 2000,
    activeProjects: 524,
    completedProjects: 4100,
    partnerships: 645,
    certifications: ['ISO 9001'],
    budget: {
      amount: 6800000000,
      currency: 'USD',
      formatted: '$6.8B',
    },
    teamMembers: 2000,
    createdAt: new Date('2016-11-05'),
    updatedAt: new Date('2024-02-08'),
  },
  {
    id: '6',
    name: 'World Bank Group',
    acronym: 'WBG',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.FINANCE, OrganizationSectorEnum.INFRASTRUCTURE],
    subSectors: [SubSectorEnum.ROADS, SubSectorEnum.BUILDINGS, SubSectorEnum.PORTS],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.NORTH_AMERICA,
    country: 'United States',
    city: 'Washington DC',
    description: 'International financial institution providing loans and grants to governments for development projects.',
    email: 'info@worldbank.org',
    website: 'https://www.worldbank.org',
    yearEstablished: 1944,
    employeeCount: 15000,
    activeProjects: 892,
    completedProjects: 5600,
    partnerships: 812,
    certifications: ['ISO 9001', 'ISO 14001'],
    budget: {
      amount: 43000000000,
      currency: 'USD',
      formatted: '$43B',
    },
    teamMembers: 15000,
    createdAt: new Date('2015-02-20'),
    updatedAt: new Date('2024-02-25'),
  },
  {
    id: '7',
    name: 'Red Cross International',
    acronym: 'ICRC',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.HUMANITARIAN, OrganizationSectorEnum.HEALTH],
    subSectors: [SubSectorEnum.HUMANITARIAN_AID, SubSectorEnum.DISASTER_RELIEF, SubSectorEnum.PRIMARY_HEALTHCARE],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Switzerland',
    city: 'Geneva',
    description: 'Humanitarian organization providing assistance in armed conflicts and natural disasters.',
    email: 'contact@icrc.org',
    website: 'https://www.icrc.org',
    yearEstablished: 1863,
    employeeCount: 20000,
    activeProjects: 678,
    completedProjects: 4500,
    partnerships: 456,
    certifications: ['ISO 9001', 'Humanitarian Standards'],
    budget: {
      amount: 2100000000,
      currency: 'USD',
      formatted: '$2.1B',
    },
    teamMembers: 20000,
    createdAt: new Date('2014-07-10'),
    updatedAt: new Date('2024-02-22'),
  },
  {
    id: '8',
    name: 'UNESCO',
    acronym: 'UNESCO',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.EDUCATION, OrganizationSectorEnum.CULTURE],
    subSectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.HIGHER_EDUCATION, SubSectorEnum.TEACHER_TRAINING],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'France',
    city: 'Paris',
    description: 'United Nations agency promoting international collaboration through education, science, and culture.',
    email: 'info@unesco.org',
    website: 'https://www.unesco.org',
    yearEstablished: 1945,
    employeeCount: 2300,
    activeProjects: 234,
    completedProjects: 1890,
    partnerships: 345,
    certifications: ['UN Verified', 'ISO 9001'],
    budget: {
      amount: 534000000,
      currency: 'USD',
      formatted: '$534M',
    },
    teamMembers: 2300,
    createdAt: new Date('2013-09-15'),
    updatedAt: new Date('2024-02-19'),
  },
  {
    id: '9',
    name: 'Save the Children',
    acronym: 'STC',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.EDUCATION, OrganizationSectorEnum.HUMANITARIAN],
    subSectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.HUMANITARIAN_AID, SubSectorEnum.DISASTER_RELIEF],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'United Kingdom',
    city: 'London',
    description: 'International NGO promoting children\'s rights and providing relief during emergencies.',
    email: 'info@savethechildren.org',
    website: 'https://www.savethechildren.org',
    yearEstablished: 1919,
    employeeCount: 25000,
    activeProjects: 567,
    completedProjects: 4200,
    partnerships: 412,
    certifications: ['ISO 9001', 'Child Protection Standards'],
    budget: {
      amount: 2300000000,
      currency: 'USD',
      formatted: '$2.3B',
    },
    teamMembers: 25000,
    createdAt: new Date('2012-04-25'),
    updatedAt: new Date('2024-02-17'),
  },
  {
    id: '10',
    name: 'Asian Development Bank',
    acronym: 'ADB',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.FINANCE, OrganizationSectorEnum.INFRASTRUCTURE],
    subSectors: [SubSectorEnum.ROADS, SubSectorEnum.BRIDGES, SubSectorEnum.TELECOMMUNICATIONS],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.ASIA,
    country: 'Philippines',
    city: 'Manila',
    description: 'Regional development bank promoting social and economic development in Asia.',
    email: 'info@adb.org',
    website: 'https://www.adb.org',
    yearEstablished: 1966,
    employeeCount: 3500,
    activeProjects: 789,
    completedProjects: 5200,
    partnerships: 678,
    certifications: ['ISO 9001', 'ISO 14001'],
    budget: {
      amount: 31700000000,
      currency: 'USD',
      formatted: '$31.7B',
    },
    teamMembers: 3500,
    createdAt: new Date('2011-11-30'),
    updatedAt: new Date('2024-02-16'),
  },
  {
    id: '11',
    name: 'Green Climate Fund',
    acronym: 'GCF',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.ENVIRONMENT, OrganizationSectorEnum.FINANCE],
    subSectors: [SubSectorEnum.CLIMATE_CHANGE, SubSectorEnum.RENEWABLE_ENERGY, SubSectorEnum.BIODIVERSITY],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.ASIA,
    country: 'South Korea',
    city: 'Incheon',
    description: 'Global fund supporting developing countries in climate change mitigation and adaptation.',
    email: 'info@gcfund.org',
    website: 'https://www.greenclimate.fund',
    yearEstablished: 2010,
    employeeCount: 350,
    activeProjects: 198,
    completedProjects: 89,
    partnerships: 234,
    certifications: ['ISO 14001', 'Climate Finance Standards'],
    budget: {
      amount: 10300000000,
      currency: 'USD',
      formatted: '$10.3B',
    },
    teamMembers: 350,
    createdAt: new Date('2010-12-15'),
    updatedAt: new Date('2024-02-14'),
  },
  {
    id: '12',
    name: 'CARE International',
    acronym: 'CARE',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.HUMANITARIAN, OrganizationSectorEnum.AGRICULTURE],
    subSectors: [SubSectorEnum.HUMANITARIAN_AID, SubSectorEnum.FOOD_SECURITY, SubSectorEnum.CROP_PRODUCTION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Switzerland',
    city: 'Geneva',
    description: 'Leading humanitarian organization fighting global poverty with focus on women and girls.',
    email: 'info@care.org',
    website: 'https://www.care-international.org',
    yearEstablished: 1945,
    employeeCount: 12000,
    activeProjects: 456,
    completedProjects: 3400,
    partnerships: 312,
    certifications: ['ISO 9001', 'Humanitarian Standards'],
    budget: {
      amount: 850000000,
      currency: 'USD',
      formatted: '$850M',
    },
    teamMembers: 12000,
    createdAt: new Date('2009-06-20'),
    updatedAt: new Date('2024-02-12'),
  },
  {
    id: '13',
    name: 'TechGlobal Innovations',
    acronym: 'TGI',
    type: OrganizationTypeEnum.PRIVATE_SECTOR,
    sectors: [OrganizationSectorEnum.TECHNOLOGY, OrganizationSectorEnum.EDUCATION],
    subSectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.VOCATIONAL_TRAINING],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.NORTH_AMERICA,
    country: 'United States',
    city: 'San Francisco',
    description: 'Technology company developing innovative solutions for education and digital transformation.',
    email: 'contact@techglobal.com',
    website: 'https://www.techglobal.com',
    yearEstablished: 2015,
    employeeCount: 850,
    activeProjects: 67,
    completedProjects: 234,
    partnerships: 89,
    certifications: ['ISO 27001', 'ISO 9001'],
    budget: {
      amount: 450000000,
      currency: 'USD',
      formatted: '$450M',
    },
    teamMembers: 850,
    createdAt: new Date('2015-03-12'),
    updatedAt: new Date('2024-02-23'),
  },
  {
    id: '14',
    name: 'Global Education Partnership',
    acronym: 'GEP',
    type: OrganizationTypeEnum.INTERNATIONAL_ORG,
    sectors: [OrganizationSectorEnum.EDUCATION],
    subSectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.SECONDARY_EDUCATION, SubSectorEnum.HIGHER_EDUCATION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.NORTH_AMERICA,
    country: 'United States',
    city: 'Washington DC',
    description: 'International partnership dedicated to ensuring quality education for all children worldwide.',
    email: 'info@globaleducation.org',
    website: 'https://www.globaleducation.org',
    yearEstablished: 2002,
    employeeCount: 450,
    activeProjects: 123,
    completedProjects: 567,
    partnerships: 234,
    certifications: ['ISO 9001', 'Education Standards'],
    budget: {
      amount: 1200000000,
      currency: 'USD',
      formatted: '$1.2B',
    },
    teamMembers: 450,
    createdAt: new Date('2008-08-08'),
    updatedAt: new Date('2024-02-11'),
  },
  {
    id: '15',
    name: 'Water for All Foundation',
    acronym: 'WFA',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.INFRASTRUCTURE, OrganizationSectorEnum.HUMANITARIAN],
    subSectors: [SubSectorEnum.ROADS, SubSectorEnum.HUMANITARIAN_AID],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.AFRICA,
    country: 'Kenya',
    city: 'Nairobi',
    description: 'Non-profit organization providing clean water and sanitation solutions to underserved communities.',
    email: 'info@waterforall.org',
    website: 'https://www.waterforall.org',
    yearEstablished: 2008,
    employeeCount: 1200,
    activeProjects: 234,
    completedProjects: 789,
    partnerships: 156,
    certifications: ['ISO 9001', 'Water Quality Standards'],
    budget: {
      amount: 180000000,
      currency: 'USD',
      formatted: '$180M',
    },
    teamMembers: 1200,
    createdAt: new Date('2007-05-14'),
    updatedAt: new Date('2024-02-09'),
  },
  {
    id: '16',
    name: 'Latin American Development Corporation',
    acronym: 'CAF',
    type: OrganizationTypeEnum.PRIVATE_SECTOR,
    sectors: [OrganizationSectorEnum.FINANCE, OrganizationSectorEnum.INFRASTRUCTURE],
    subSectors: [SubSectorEnum.ROADS, SubSectorEnum.PORTS, SubSectorEnum.BUILDINGS],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.LATIN_AMERICA,
    country: 'Venezuela',
    city: 'Caracas',
    description: 'Development bank promoting sustainable development in Latin America through financing.',
    email: 'info@caf.com',
    website: 'https://www.caf.com',
    yearEstablished: 1970,
    employeeCount: 780,
    activeProjects: 345,
    completedProjects: 1234,
    partnerships: 456,
    certifications: ['ISO 9001', 'Financial Standards'],
    budget: {
      amount: 12500000000,
      currency: 'USD',
      formatted: '$12.5B',
    },
    teamMembers: 780,
    createdAt: new Date('2006-12-01'),
    updatedAt: new Date('2024-02-07'),
  },
  {
    id: '17',
    name: 'Research Institute for Sustainable Agriculture',
    acronym: 'RISA',
    type: OrganizationTypeEnum.RESEARCH_INSTITUTION,
    sectors: [OrganizationSectorEnum.AGRICULTURE, OrganizationSectorEnum.ENVIRONMENT],
    subSectors: [SubSectorEnum.CROP_PRODUCTION, SubSectorEnum.IRRIGATION, SubSectorEnum.CLIMATE_CHANGE],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.ASIA,
    country: 'India',
    city: 'New Delhi',
    description: 'Leading research institute developing sustainable agricultural practices and technologies.',
    email: 'info@risa.org',
    website: 'https://www.risa.org',
    yearEstablished: 1998,
    employeeCount: 450,
    activeProjects: 89,
    completedProjects: 345,
    partnerships: 167,
    certifications: ['ISO 9001', 'Research Standards'],
    budget: {
      amount: 95000000,
      currency: 'USD',
      formatted: '$95M',
    },
    teamMembers: 450,
    createdAt: new Date('2005-09-22'),
    updatedAt: new Date('2024-02-06'),
  },
  {
    id: '18',
    name: 'Global Health Initiative',
    acronym: 'GHI',
    type: OrganizationTypeEnum.GOVERNMENT_AGENCY,
    sectors: [OrganizationSectorEnum.HEALTH],
    subSectors: [SubSectorEnum.PRIMARY_HEALTHCARE, SubSectorEnum.INFECTIOUS_DISEASES],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.NORTH_AMERICA,
    country: 'Canada',
    city: 'Ottawa',
    description: 'Government agency coordinating international health programs and disease prevention.',
    email: 'info@ghi.ca',
    website: 'https://www.ghi.ca',
    yearEstablished: 2005,
    employeeCount: 560,
    activeProjects: 123,
    completedProjects: 456,
    partnerships: 234,
    certifications: ['ISO 9001', 'Health Standards'],
    budget: {
      amount: 340000000,
      currency: 'CAD',
      formatted: '$340M CAD',
    },
    teamMembers: 560,
    createdAt: new Date('2004-11-18'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    id: '19',
    name: 'European Cultural Foundation',
    acronym: 'ECF',
    type: OrganizationTypeEnum.NGO,
    sectors: [OrganizationSectorEnum.CULTURE, OrganizationSectorEnum.EDUCATION],
    subSectors: [SubSectorEnum.PRIMARY_EDUCATION, SubSectorEnum.HIGHER_EDUCATION],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.EUROPE,
    country: 'Netherlands',
    city: 'Amsterdam',
    description: 'Foundation supporting cultural cooperation and artistic expression across Europe.',
    email: 'info@culturalfoundation.eu',
    website: 'https://www.culturalfoundation.eu',
    yearEstablished: 1954,
    employeeCount: 85,
    activeProjects: 67,
    completedProjects: 345,
    partnerships: 123,
    certifications: ['ISO 9001', 'Cultural Standards'],
    budget: {
      amount: 25000000,
      currency: 'EUR',
      formatted: '€25M',
    },
    teamMembers: 85,
    createdAt: new Date('2003-07-30'),
    updatedAt: new Date('2024-02-04'),
  },
  {
    id: '20',
    name: 'Pacific Trade Alliance',
    acronym: 'PTA',
    type: OrganizationTypeEnum.PRIVATE_SECTOR,
    sectors: [OrganizationSectorEnum.TRADE, OrganizationSectorEnum.FINANCE],
    status: OrganizationStatusEnum.VERIFIED,
    region: RegionEnum.OCEANIA,
    country: 'Australia',
    city: 'Sydney',
    description: 'Trade organization facilitating commerce and investment across Pacific nations.',
    email: 'info@pacifictrade.org',
    website: 'https://www.pacifictrade.org',
    yearEstablished: 2012,
    employeeCount: 320,
    activeProjects: 78,
    completedProjects: 234,
    partnerships: 189,
    certifications: ['ISO 9001', 'Trade Standards'],
    budget: {
      amount: 140000000,
      currency: 'AUD',
      formatted: '$140M AUD',
    },
    teamMembers: 320,
    createdAt: new Date('2012-03-15'),
    updatedAt: new Date('2024-02-03'),
  },
];

const mockKPIs: OrganizationKPIs = {
  totalOrganizations: 2547,
  activeOrganizations: 1923,
  verifiedOrganizations: 876,
  partnerships: 456,
  newPartnerships: 18,
  countriesCovered: 127,
  invitations: 42,
  pendingInvitations: 7,
};

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<PaginatedOrganizations>({
    data: [],
    meta: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const [kpis, setKpis] = useState<OrganizationKPIs>(mockKPIs);
  const [filters, setFilters] = useState<OrganizationFilters>({});
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedOrganizations, setSavedOrganizations] = useState<Set<string>>(new Set());

  // Load organizations based on filters
  useEffect(() => {
    loadOrganizations();
  }, [filters, sortBy, currentPage]);

  const loadOrganizations = () => {
    let filtered = [...mockOrganizations];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.acronym?.toLowerCase().includes(query) ||
          org.description.toLowerCase().includes(query)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((org) => filters.type!.includes(org.type));
    }

    if (filters.sectors && filters.sectors.length > 0) {
      filtered = filtered.filter((org) =>
        org.sectors.some((sector) => filters.sectors!.includes(sector))
      );
    }

    // SubSectors filter - filter organizations that have the selected subsectors
    if (filters.subSectors && filters.subSectors.length > 0) {
      filtered = filtered.filter((org) => {
        if (!org.subSectors || org.subSectors.length === 0) {
          // If organization has no subsectors, check if it has matching parent sectors
          const parentSectors = new Set<string>();
          filters.subSectors!.forEach((subSector) => {
            Object.entries(ORGANIZATION_SECTOR_SUBSECTOR_MAP).forEach(([sector, subsectors]) => {
              if (subsectors.includes(subSector)) {
                parentSectors.add(sector);
              }
            });
          });
          return org.sectors.some((sector) => parentSectors.has(sector));
        }
        // If organization has subsectors, check direct match
        return org.subSectors.some((subSector) => filters.subSectors!.includes(subSector));
      });
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((org) => filters.status!.includes(org.status));
    }

    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter((org) => filters.region!.includes(org.region));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'partnerships':
          return b.partnerships - a.partnerships;
        case 'projects':
          return b.activeProjects - a.activeProjects;
        default:
          return 0;
      }
    });

    // Pagination
    const pageSize = 10;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setOrganizations({
      data: paginatedData,
      meta: {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  };

  const updateFilters = (newFilters: Partial<OrganizationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const saveOrganization = (id: string) => {
    setSavedOrganizations((prev) => new Set([...prev, id]));
  };

  const unsaveOrganization = (id: string) => {
    setSavedOrganizations((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isOrganizationSaved = (id: string) => savedOrganizations.has(id);

  return {
    organizations,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    saveOrganization,
    unsaveOrganization,
    isOrganizationSaved,
    allOrganizations: mockOrganizations,
  };
}