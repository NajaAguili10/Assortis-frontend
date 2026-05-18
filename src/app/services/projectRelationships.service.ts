import { getOrganizationPartnerContract, type OrganizationPartnerContract } from './organizationPartnerContracts.service';

export type RelatedItemKind = 'project' | 'contract';

export interface EarlyIntelligenceRelatedItem {
  id: string;
  kind: RelatedItemKind;
  name: string;
  status: string;
  phase: string;
  organizationName?: string;
  partnerName?: string;
  dateLabel?: string;
  dateValue?: string;
  detailPath: string;
}

export interface ProjectRelationships {
  projectId: string;
  relatedProjects: EarlyIntelligenceRelatedItem[];
  relatedContracts: EarlyIntelligenceRelatedItem[];
}

const normalizePhase = (value?: string | null) => (value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');

export const isEarlyIntelligencePhase = (...values: Array<string | undefined | null>) =>
  values.some(value => {
    const normalized = normalizePhase(value);
    return normalized === 'early intelligence' || normalized.includes('early intelligence');
  });

const CONTRACT_IDS = ['contract-nordic-001', 'contract-baltic-001', 'contract-ein-001'];

export const getProjectRelationships = async (projectId: string): Promise<ProjectRelationships> => {
  const contracts = (await Promise.all(CONTRACT_IDS.map(id => getOrganizationPartnerContract(id))))
    .filter(Boolean) as OrganizationPartnerContract[];

  return {
    projectId,
    relatedProjects: [
      {
        id: 'related-project-education-facilities',
        kind: 'project',
        name: 'County School Upgrades Program',
        status: 'Open',
        phase: 'Early Intelligence',
        organizationName: 'World Bank',
        partnerName: 'Nordic Policy Centre',
        dateLabel: 'Published',
        dateValue: '2024-07-08',
        detailPath: '/projects/1',
      },
      {
        id: 'related-project-digital-readiness',
        kind: 'project',
        name: 'Technical assistance for public administration reform and digital readiness',
        status: 'Active',
        phase: 'Open Procurement',
        organizationName: 'European Commission',
        partnerName: 'Baltic Development Advisors',
        dateLabel: 'Deadline',
        dateValue: '2024-09-18',
        detailPath: '/projects/3',
      },
    ],
    relatedContracts: contracts.map(contract => ({
      id: contract.id,
      kind: 'contract',
      name: contract.title,
      status: contract.status,
      phase: 'Contract / Shortlist',
      organizationName: contract.organizationName,
      partnerName: contract.partnerName,
      dateLabel: contract.endDate ? 'Ends' : 'Starts',
      dateValue: contract.endDate || contract.startDate,
      detailPath: `/organizations/${contract.organizationId}/partners/${contract.partnerId}/contracts/${contract.id}`,
    })),
  };
};
