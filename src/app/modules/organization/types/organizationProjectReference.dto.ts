import {
  CountryEnum,
  FundingAgencyEnum,
  RegionEnum,
  SectorEnum,
  SubSectorEnum,
} from '@app/types/tender.dto';
import { ReferenceTypeEnum } from '@app/types/project.dto';

export type OrganizationProjectReferenceStatus = 'ongoing' | 'completed';
export type OrganizationProjectDocumentType = 'tor' | 'report';

export interface OrganizationProjectReferenceDocumentDTO {
  id: string;
  name: string;
  type: OrganizationProjectDocumentType;
  uploadedAt: string;
  mimeType: string;
  size: number;
  contentDataUrl?: string;
}

export interface OrganizationProjectReferenceDTO {
  id: string;
  referenceNumber: string;
  title: string;
  summary: string;
  description: string;
  country: CountryEnum;
  region: RegionEnum;
  sector: SectorEnum;
  subSector?: SubSectorEnum;
  client: string;
  donor: FundingAgencyEnum;
  startDate: string;
  endDate: string;
  status: OrganizationProjectReferenceStatus;
  referenceType?: ReferenceTypeEnum;
  url?: string;
  documents: OrganizationProjectReferenceDocumentDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationProjectReferenceFormValues {
  referenceNumber: string;
  title: string;
  summary: string;
  description: string;
  country: CountryEnum;
  region: RegionEnum;
  sector: SectorEnum;
  subSector?: SubSectorEnum;
  client: string;
  donor: FundingAgencyEnum;
  startDate: string;
  endDate: string;
  status: OrganizationProjectReferenceStatus;
  referenceType?: ReferenceTypeEnum;
  url?: string;
  documents: OrganizationProjectReferenceDocumentDTO[];
}
