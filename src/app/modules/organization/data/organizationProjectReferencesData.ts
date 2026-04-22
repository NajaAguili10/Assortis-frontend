import {
  CountryEnum,
  FundingAgencyEnum,
  RegionEnum,
  SectorEnum,
  SubSectorEnum,
} from '@app/types/tender.dto';
import { OrganizationProjectReferenceDTO } from '@app/modules/organization/types/organizationProjectReference.dto';

const now = new Date().toISOString();

export const organizationProjectReferencesSeed: OrganizationProjectReferenceDTO[] = [
  {
    id: 'org-ref-1',
    referenceNumber: 'ORG-REF-2024-001',
    title: 'Regional Education Systems Strengthening',
    summary: 'Multi-year technical assistance project supporting curriculum reform and school governance.',
    description:
      'Global Development Partners led the delivery of technical assistance, teacher training support, and implementation oversight across regional education ministries. The assignment combined policy support, capacity building, and performance monitoring for national stakeholders.',
    country: CountryEnum.SENEGAL,
    region: RegionEnum.AFRICA,
    sector: SectorEnum.EDUCATION,
    subSector: SubSectorEnum.TEACHER_TRAINING,
    client: 'Ministry of Education',
    donor: FundingAgencyEnum.WORLD_BANK,
    startDate: '2022-02-01',
    endDate: '2024-11-30',
    status: 'ongoing',
    documents: [
      {
        id: 'org-ref-1-doc-1',
        name: 'Education Systems ToR.pdf',
        type: 'tor',
        uploadedAt: now,
        mimeType: 'application/pdf',
        size: 248000,
      },
      {
        id: 'org-ref-1-doc-2',
        name: 'Quarterly Progress Report Q1.pdf',
        type: 'report',
        uploadedAt: now,
        mimeType: 'application/pdf',
        size: 412000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'org-ref-2',
    referenceNumber: 'ORG-REF-2023-004',
    title: 'Urban Health Facility Rehabilitation',
    summary: 'Infrastructure and procurement support program for urban primary health centers.',
    description:
      'The organization coordinated rehabilitation packages, quality assurance, and procurement monitoring for health facility upgrades in dense urban areas. The project included site supervision, stakeholder coordination, and post-implementation reporting.',
    country: CountryEnum.KENYA,
    region: RegionEnum.AFRICA,
    sector: SectorEnum.HEALTH,
    client: 'County Health Directorate',
    donor: FundingAgencyEnum.AFRICAN_DEVELOPMENT_BANK,
    startDate: '2021-06-15',
    endDate: '2023-12-20',
    status: 'completed',
    documents: [
      {
        id: 'org-ref-2-doc-1',
        name: 'Health Rehabilitation Final Report.pdf',
        type: 'report',
        uploadedAt: now,
        mimeType: 'application/pdf',
        size: 638000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'org-ref-3',
    referenceNumber: 'ORG-REF-2024-007',
    title: 'Climate-Smart Water Resilience Initiative',
    summary: 'Technical advisory project for resilient water infrastructure and operational planning.',
    description:
      'Global Development Partners supported resilient water-system design, climate risk assessment, and implementation planning for local authorities. The workstream covered feasibility analysis, stakeholder facilitation, and reporting to donor teams.',
    country: CountryEnum.GHANA,
    region: RegionEnum.AFRICA,
    sector: SectorEnum.WATER_AND_SANITATION,
    subSector: SubSectorEnum.WATER_SUPPLY,
    client: 'Metropolitan Water Utility',
    donor: FundingAgencyEnum.EUROPEAN_UNION,
    startDate: '2023-09-01',
    endDate: '2025-03-31',
    status: 'ongoing',
    documents: [
      {
        id: 'org-ref-3-doc-1',
        name: 'Water Resilience ToR.docx',
        type: 'tor',
        uploadedAt: now,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 192000,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];
