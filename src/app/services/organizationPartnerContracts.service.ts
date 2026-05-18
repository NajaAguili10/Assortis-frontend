export interface OrganizationPartnerContract {
  id: string;
  organizationId: string;
  organizationName: string;
  partnerId: string;
  partnerName: string;
  title: string;
  reference: string;
  status: 'Active' | 'Awarded' | 'Completed' | 'Closed';
  startDate?: string;
  endDate?: string;
  relatedProjectId?: string;
  relatedProjectName?: string;
}

export const slugifyPartnerName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const CONTRACTS: OrganizationPartnerContract[] = [
  {
    id: 'contract-nordic-001',
    organizationId: '1',
    organizationName: 'Civitta International OU',
    partnerId: 'nordic-policy-centre',
    partnerName: 'Nordic Policy Centre',
    title: 'Digital Governance Readiness Facility',
    reference: 'CTR-2024-001',
    status: 'Active',
    startDate: '2024-03-15',
    endDate: '2025-03-14',
    relatedProjectId: '1',
    relatedProjectName: 'Organisational development services',
  },
  {
    id: 'contract-nordic-002',
    organizationId: '1',
    organizationName: 'Civitta International OU',
    partnerId: 'nordic-policy-centre',
    partnerName: 'Nordic Policy Centre',
    title: 'EU Policy Dialogue and Knowledge Management',
    reference: 'CTR-2023-118',
    status: 'Completed',
    startDate: '2023-02-01',
    endDate: '2024-01-31',
    relatedProjectId: '2',
    relatedProjectName: 'Provision of interim agent support services',
  },
  {
    id: 'contract-baltic-001',
    organizationId: '1',
    organizationName: 'Civitta International OU',
    partnerId: 'baltic-development-advisors',
    partnerName: 'Baltic Development Advisors',
    title: 'Public Administration Reform Support',
    reference: 'CTR-2024-044',
    status: 'Awarded',
    startDate: '2024-05-01',
    endDate: '2025-04-30',
    relatedProjectId: '3',
    relatedProjectName: 'Technical assistance for public administration reform and digital readiness',
  },
  {
    id: 'contract-baltic-002',
    organizationId: '1',
    organizationName: 'Civitta International OU',
    partnerId: 'baltic-development-advisors',
    partnerName: 'Baltic Development Advisors',
    title: 'Regional Agency Digital Transformation Advisory',
    reference: 'CTR-2023-071',
    status: 'Closed',
    startDate: '2023-06-10',
    endDate: '2023-12-22',
    relatedProjectId: '4',
    relatedProjectName: 'Digital transformation advisory services for regional agencies',
  },
  {
    id: 'contract-ein-001',
    organizationId: '1',
    organizationName: 'Civitta International OU',
    partnerId: 'european-innovation-network',
    partnerName: 'European Innovation Network',
    title: 'EU Defence Innovation Scheme Hackathon and Mentoring',
    reference: 'CTR-2023-204',
    status: 'Completed',
    startDate: '2023-12-21',
    endDate: '2024-06-30',
    relatedProjectId: '5',
    relatedProjectName: 'Framework Contract for EU Defence Innovation Scheme Hackathon and Mentoring',
  },
];

export const getOrganizationPartnerContracts = async (
  organizationId: string,
  partnerId: string
): Promise<OrganizationPartnerContract[]> => {
  return CONTRACTS.filter(
    contract => String(contract.organizationId) === String(organizationId) && contract.partnerId === partnerId
  );
};

export const getOrganizationPartnerContract = async (
  contractId: string
): Promise<OrganizationPartnerContract | undefined> => {
  return CONTRACTS.find(contract => contract.id === contractId);
};
