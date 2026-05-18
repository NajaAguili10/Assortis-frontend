import { apiClient } from '@app/api/apiClient';
import {
  OrganizationProjectReferenceDTO,
  OrganizationProjectReferenceDocumentDTO,
  OrganizationProjectReferenceFormValues,
  OrganizationProjectReferenceStatus,
} from '@app/modules/organization/types/organizationProjectReference.dto';
import { FundingAgencyEnum } from '@app/types/tender.dto';

interface OrganizationProjectReferenceApiDocumentDTO {
  id: number | null;
  name: string;
  type: string;
  uploadedAt: string;
  mimeType?: string | null;
  size: number;
  contentDataUrl?: string | null;
}

interface OrganizationProjectReferenceApiDTO {
  id: number;
  organizationId?: number;
  referenceNumber?: string | null;
  title?: string | null;
  summary?: string | null;
  description?: string | null;
  country?: string | null;
  countryName?: string | null;
  region?: string | null;
  regionLabel?: string | null;
  sector?: string | null;
  sectorName?: string | null;
  subSector?: string | null;
  subSectorName?: string | null;
  client?: string | null;
  donor?: string | null;
  donorName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  referenceType?: string | null;
  url?: string | null;
  documents?: OrganizationProjectReferenceApiDocumentDTO[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const FUNDING_AGENCY_ALIASES: Record<string, FundingAgencyEnum> = {
  WORLD_BANK: FundingAgencyEnum.WB,
  WB: FundingAgencyEnum.WB,
  AFRICAN_DEVELOPMENT_BANK: FundingAgencyEnum.AFDB,
  AFDB: FundingAgencyEnum.AFDB,
  EUROPEAN_COMMISSION: FundingAgencyEnum.EC,
  EC: FundingAgencyEnum.EC,
  EUROPEAN_UNION: FundingAgencyEnum.EU_INSTITUTIONS,
  EU_INSTITUTIONS: FundingAgencyEnum.EU_INSTITUTIONS,
};

const normalizeStatus = (value?: string | null): OrganizationProjectReferenceStatus => {
  return String(value).toLowerCase() === 'verified' ? 'verified' : 'notVerified';
};

const normalizeFundingAgency = (value?: string | null): FundingAgencyEnum => {
  const normalized = String(value || '').trim().toUpperCase();
  if (Object.values(FundingAgencyEnum).includes(normalized as FundingAgencyEnum)) {
    return normalized as FundingAgencyEnum;
  }
  return FUNDING_AGENCY_ALIASES[normalized] || FundingAgencyEnum.WB;
};

const mapDocument = (
  document: OrganizationProjectReferenceApiDocumentDTO,
): OrganizationProjectReferenceDocumentDTO => ({
  id: String(document.id ?? crypto.randomUUID()),
  name: document.name || '',
  type: document.type === 'tor' ? 'tor' : 'report',
  uploadedAt: document.uploadedAt || new Date().toISOString(),
  mimeType: document.mimeType || undefined,
  size: typeof document.size === 'number' ? document.size : 0,
  contentDataUrl: document.contentDataUrl || undefined,
});

const mapReference = (reference: OrganizationProjectReferenceApiDTO): OrganizationProjectReferenceDTO => ({
  id: String(reference.id),
  organizationId: reference.organizationId,
  referenceNumber: reference.referenceNumber || '',
  title: reference.title || '',
  summary: reference.summary || '',
  description: reference.description || '',
  country: (reference.country || '') as any,
  countryName: reference.countryName || undefined,
  region: (reference.region || '') as any,
  regionLabel: reference.regionLabel || undefined,
  sector: (reference.sector || '') as any,
  sectorName: reference.sectorName || undefined,
  subSector: (reference.subSector || undefined) as any,
  subSectorName: reference.subSectorName || undefined,
  client: reference.client || '',
  donor: normalizeFundingAgency(reference.donor),
  donorName: reference.donorName || undefined,
  startDate: reference.startDate || '',
  endDate: reference.endDate || '',
  status: normalizeStatus(reference.status),
  referenceType: (reference.referenceType || undefined) as any,
  url: reference.url || undefined,
  documents: (reference.documents || []).map(mapDocument),
  createdAt: reference.createdAt || new Date().toISOString(),
  updatedAt: reference.updatedAt || reference.createdAt || new Date().toISOString(),
});

const mapDocumentsForRequest = (documents: OrganizationProjectReferenceDocumentDTO[]) => (
  documents.map((document) => {
    const numericId = Number(document.id);
    return {
      id: Number.isFinite(numericId) ? numericId : null,
      name: document.name,
      type: document.type,
      uploadedAt: document.uploadedAt,
      mimeType: document.mimeType,
      size: document.size,
      contentDataUrl: document.contentDataUrl,
    };
  })
);

const mapRequest = (values: OrganizationProjectReferenceFormValues) => ({
  referenceNumber: values.referenceNumber || null,
  title: values.title,
  summary: values.summary,
  description: values.description,
  country: values.country || null,
  region: values.region || null,
  sector: values.sector || null,
  subSector: values.subSector || null,
  client: values.client,
  donor: values.donor || null,
  startDate: values.startDate || null,
  endDate: values.endDate || null,
  status: values.status,
  referenceType: values.referenceType || null,
  url: values.url || null,
  documents: mapDocumentsForRequest(values.documents),
});

export const organizationProjectReferenceService = {
  getReferences: async (): Promise<OrganizationProjectReferenceDTO[]> => {
    const response = await apiClient.get<OrganizationProjectReferenceApiDTO[]>('/organization-project-references');
    return response.map(mapReference);
  },

  getReference: async (id: string | number): Promise<OrganizationProjectReferenceDTO> => {
    const response = await apiClient.get<OrganizationProjectReferenceApiDTO>(`/organization-project-references/${id}`);
    return mapReference(response);
  },

  createReference: async (values: OrganizationProjectReferenceFormValues): Promise<OrganizationProjectReferenceDTO> => {
    const response = await apiClient.post<OrganizationProjectReferenceApiDTO>(
      '/organization-project-references',
      mapRequest(values),
    );
    return mapReference(response);
  },

  updateReference: async (
    id: string | number,
    values: OrganizationProjectReferenceFormValues,
  ): Promise<OrganizationProjectReferenceDTO> => {
    const response = await apiClient.put<OrganizationProjectReferenceApiDTO>(
      `/organization-project-references/${id}`,
      mapRequest(values),
    );
    return mapReference(response);
  },

  deleteReference: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/organization-project-references/${id}`);
  },
};
