import { CountryEnum, FundingAgencyEnum, SectorEnum, SubSectorEnum } from '@app/types/tender.dto';

export type ProjectReferenceValidationState = 'draft' | 'valid';
export type ProjectReferenceProjectStatus = 'ongoing' | 'past';
export type ProjectReferenceFicheModalMode = 'view' | 'edit';

export interface ProjectReferenceFicheDTO {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  organizationName: string;
  sector: SectorEnum;
  subSector?: SubSectorEnum;
  country: CountryEnum;
  donor?: FundingAgencyEnum;
  budgetFormatted?: string;
  startDate: string;
  endDate: string;
  deadline?: string;
  projectStatus: ProjectReferenceProjectStatus;
  referenceState: ProjectReferenceValidationState;
}
