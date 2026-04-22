import {
  ContractorCollaborationDTO,
  ContractorOrganizationDTO,
} from '@app/modules/expert/types/expert-projects-scoring.dto';

export const expertContractorOrganizationsMock: ContractorOrganizationDTO[] = [
  {
    id: 'org-wb',
    name: 'World Bank',
    description: 'Multilateral development organization supporting public sector reforms and infrastructure.',
    bookmarked: true,
  },
  {
    id: 'org-unicef',
    name: 'UNICEF',
    description: 'International organization focused on child rights and social sector programs.',
    bookmarked: true,
  },
  {
    id: 'org-fao',
    name: 'FAO',
    description: 'UN agency advancing food security and sustainable agriculture initiatives.',
    bookmarked: false,
  },
  {
    id: 'org-afdb',
    name: 'African Development Bank',
    description: 'Regional development finance institution with large-scale portfolio projects.',
    bookmarked: true,
  },
  {
    id: 'org-undp',
    name: 'UNDP',
    description: 'Global development agency with governance, resilience, and climate portfolios.',
    bookmarked: false,
  },
];

export const expertContractorCollaborationsMock: ContractorCollaborationDTO[] = [
  {
    id: 'collab-1',
    contractorId: 'org-wb',
    projectName: 'Rural Education Infrastructure Development',
    startDate: '2023-06-01',
    endDate: '2024-11-30',
    score: {
      financialPackageFairness: 9,
      contractualTermsRespect: 8,
      communicationQuality: 9,
      technicalBackstopping: 8,
      financialBackstopping: 7,
      adminLogisticsBackstopping: 8,
    },
    updatedAt: '2026-04-01',
  },
  {
    id: 'collab-2',
    contractorId: 'org-wb',
    projectName: 'Local Governance Digitization Program',
    startDate: '2021-02-01',
    endDate: '2022-12-15',
  },
  {
    id: 'collab-3',
    contractorId: 'org-unicef',
    projectName: 'Maternal and Child Health Improvement',
    startDate: '2022-03-12',
    endDate: '2024-01-20',
    score: {
      financialPackageFairness: 8,
      contractualTermsRespect: 9,
      communicationQuality: 9,
      technicalBackstopping: 8,
      financialBackstopping: 8,
      adminLogisticsBackstopping: 9,
    },
    updatedAt: '2026-04-07',
  },
  {
    id: 'collab-4',
    contractorId: 'org-fao',
    projectName: 'Sustainable Agriculture Capacity Building',
    startDate: '2024-01-10',
    endDate: '2025-12-20',
  },
  {
    id: 'collab-5',
    contractorId: 'org-afdb',
    projectName: 'Water Supply and Sanitation Expansion',
    startDate: '2021-04-01',
    endDate: '2023-10-15',
    score: {
      financialPackageFairness: 7,
      contractualTermsRespect: 7,
      communicationQuality: 6,
      technicalBackstopping: 8,
      financialBackstopping: 7,
      adminLogisticsBackstopping: 6,
    },
    updatedAt: '2026-03-20',
  },
  {
    id: 'collab-6',
    contractorId: 'org-undp',
    projectName: 'Climate Adaptation Local Resilience Program',
    startDate: '2022-09-01',
    endDate: '2024-08-31',
  },
];
