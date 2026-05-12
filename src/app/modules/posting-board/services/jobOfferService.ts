import { apiClient } from '../../../api/apiClient';
import {
  JobOfferListDTO,
  JobOfferDetailDTO,
  JobOfferCreateDTO,
  JobOfferTypeEnum,
  JobOfferStatusEnum,
} from '../types/JobOffer.dto';

type BackendJobOffer = {
  id: number | string;
  title?: string;
  description?: string;
  contractType?: string;
  deadline?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: number | string;
  organizationName?: string;
  projectId?: number | string | null;
  projectTitle?: string | null;
  location?: string | null;
  department?: string | null;
  contactEmail?: string | null;
  contactPerson?: string | null;
  applicationsCount?: number | null;
  totalApplications?: number | null;
  requirements?: string | string[] | null;
  type?: string | null;
  logoUrl?: string | null;
  jobFunction?: string | null;
  otherFunction?: string | null;
  publishOnBoard?: boolean | null;
  linkedProjectId?: number | string | null;
  projectSummary?: string | null;
  descriptionPlainText?: string | null;
  sectors?: string[] | null;
  subSectors?: string[] | null;
  regions?: string[] | null;
  countries?: string[] | null;
  cities?: string[] | null;
  customCities?: string[] | null;
  homeBased?: boolean | null;
  seniority?: string | null;
  restrictions?: string | null;
  contractDurationDays?: number | null;
  overDurationDays?: boolean | null;
  applicationLink?: string | null;
  estimatedStartDate?: string | null;
  deadlineTime?: string | null;
  applicationMethod?: string | null;
  contactPersonFunction?: string | null;
};

type JobOfferUpsertPayload = {
  title: string;
  description: string;
  contractType: string;
  deadline: string;
  status: string;
  type: string;
  projectTitle?: string | null;
  department?: string | null;
  location?: string | null;
  contactEmail?: string | null;
  contactPerson?: string | null;
  organizationId?: number | null;
  logoUrl?: string | null;
  jobFunction?: string | null;
  otherFunction?: string | null;
  publishOnBoard?: boolean;
  linkedProjectId?: string | null;
  projectSummary?: string | null;
  descriptionPlainText?: string | null;
  sectors?: string[];
  subSectors?: string[];
  regions?: string[];
  countries?: string[];
  cities?: string[];
  customCities?: string[];
  homeBased?: boolean;
  seniority?: string | null;
  restrictions?: string | null;
  contractDurationDays?: number | null;
  overDurationDays?: boolean;
  applicationLink?: string | null;
  estimatedStartDate?: string | null;
  deadlineTime?: string | null;
  applicationMethod?: string | null;
  contactPersonFunction?: string | null;
};

const STORAGE_KEY = 'postingBoard.jobOffers';

const readStoredOffers = (): BackendJobOffer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredOffers = (offers: BackendJobOffer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch {
    // Local fallback is best-effort only.
  }
};

const normalizeStatus = (value?: string): JobOfferStatusEnum => {
  switch ((value || '').toUpperCase()) {
    case JobOfferStatusEnum.DRAFT:
      return JobOfferStatusEnum.DRAFT;
    case JobOfferStatusEnum.CLOSED:
      return JobOfferStatusEnum.CLOSED;
    case JobOfferStatusEnum.CANCELLED:
      return JobOfferStatusEnum.CANCELLED;
    case JobOfferStatusEnum.PUBLISHED:
    default:
      return JobOfferStatusEnum.PUBLISHED;
  }
};

const normalizeType = (offer: BackendJobOffer): JobOfferTypeEnum => {
  const explicitType = (offer.type || '').toUpperCase();
  if (explicitType === JobOfferTypeEnum.INTERNAL) {
    return JobOfferTypeEnum.INTERNAL;
  }
  if (explicitType === JobOfferTypeEnum.PROJECT_LINKED) {
    return JobOfferTypeEnum.PROJECT_LINKED;
  }
  if (explicitType === JobOfferTypeEnum.PROJECT_NEW) {
    return JobOfferTypeEnum.PROJECT_NEW;
  }
  if (explicitType === JobOfferTypeEnum.PROJECT) {
    return JobOfferTypeEnum.PROJECT;
  }
  return offer.projectId || offer.projectTitle ? JobOfferTypeEnum.PROJECT : JobOfferTypeEnum.INTERNAL;
};

const normalizeRequirements = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value || undefined;
};

const getDaysRemaining = (deadline?: string) => {
  if (!deadline) {
    return 0;
  }

  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const normalizeOffer = (offer: BackendJobOffer): JobOfferDetailDTO => {
  const type = normalizeType(offer);
  const deadline = offer.deadline || new Date().toISOString().split('T')[0];
  const publishedAt = offer.createdAt ? offer.createdAt.split('T')[0] : deadline;

  return {
    id: String(offer.id),
    publishOnBoard: offer.publishOnBoard ?? true,
    logoUrl: offer.logoUrl || undefined,
    jobFunction: offer.jobFunction || undefined,
    otherFunction: offer.otherFunction || undefined,
    linkedProjectId: offer.linkedProjectId ? String(offer.linkedProjectId) : offer.projectId ? String(offer.projectId) : undefined,
    jobTitle: offer.title || '',
    location: offer.location || '',
    projectTitle: offer.projectTitle || undefined,
    projectSummary: offer.projectSummary || undefined,
    department: offer.department || (type === JobOfferTypeEnum.INTERNAL ? offer.contractType || undefined : undefined),
    type,
    duration: offer.contractType || (offer.contractDurationDays ? `${offer.overDurationDays ? 'Over ' : ''}${offer.contractDurationDays} days` : ''),
    contractDurationDays: offer.contractDurationDays ?? undefined,
    overDurationDays: offer.overDurationDays ?? false,
    description: offer.description || '',
    descriptionPlainText: offer.descriptionPlainText || offer.description || '',
    sectors: offer.sectors || [],
    subSectors: offer.subSectors || [],
    regions: offer.regions || [],
    countries: offer.countries || [],
    cities: offer.cities || [],
    customCities: offer.customCities || [],
    homeBased: offer.homeBased ?? false,
    seniority: offer.seniority || undefined,
    restrictions: offer.restrictions || undefined,
    estimatedStartDate: offer.estimatedStartDate || undefined,
    applicationLink: offer.applicationLink || undefined,
    deadlineTime: offer.deadlineTime || undefined,
    applicationMethod: (offer.applicationMethod as any) || undefined,
    publishedAt,
    deadline,
    status: normalizeStatus(offer.status),
    daysRemaining: getDaysRemaining(deadline),
    organizationName: offer.organizationName || undefined,
    recruiterId: String(offer.organizationId || ''),
    applicationsCount: offer.applicationsCount ?? offer.totalApplications ?? 0,
    requirements: normalizeRequirements(offer.requirements),
    contactEmail: offer.contactEmail || undefined,
    contactPerson: offer.contactPerson || undefined,
    contactPersonFunction: offer.contactPersonFunction || undefined,
    totalApplications: offer.totalApplications ?? offer.applicationsCount ?? 0,
    createdAt: offer.createdAt || new Date().toISOString(),
    updatedAt: offer.updatedAt || offer.createdAt || new Date().toISOString(),
  };
};

const buildPayload = (data: JobOfferCreateDTO): JobOfferUpsertPayload => ({
  title: data.jobTitle,
  description: data.description,
  contractType: data.duration || (data.contractDurationDays ? `${data.overDurationDays ? 'Over ' : ''}${data.contractDurationDays} days` : ''),
  deadline: data.deadline,
  status: data.publishOnBoard === false ? JobOfferStatusEnum.DRAFT : JobOfferStatusEnum.PUBLISHED,
  type: data.type,
  logoUrl: data.logoUrl || null,
  jobFunction: data.jobFunction || null,
  otherFunction: data.otherFunction || null,
  projectTitle: data.type === JobOfferTypeEnum.PROJECT || data.type === JobOfferTypeEnum.PROJECT_LINKED || data.type === JobOfferTypeEnum.PROJECT_NEW ? data.projectTitle || null : null,
  department: data.type === JobOfferTypeEnum.INTERNAL ? data.department || null : null,
  location: data.location || null,
  contactEmail: data.contactEmail || null,
  contactPerson: data.contactPerson || null,
  publishOnBoard: data.publishOnBoard !== false,
  linkedProjectId: data.linkedProjectId || null,
  projectSummary: data.projectSummary || null,
  descriptionPlainText: data.descriptionPlainText || data.description,
  sectors: data.sectors || [],
  subSectors: data.subSectors || [],
  regions: data.regions || [],
  countries: data.countries || [],
  cities: data.cities || [],
  customCities: data.customCities || [],
  homeBased: data.homeBased || false,
  seniority: data.seniority || null,
  restrictions: data.restrictions || null,
  contractDurationDays: data.contractDurationDays || null,
  overDurationDays: data.overDurationDays || false,
  applicationLink: data.applicationLink || null,
  estimatedStartDate: data.estimatedStartDate || null,
  deadlineTime: data.deadlineTime || null,
  applicationMethod: data.applicationMethod || null,
  contactPersonFunction: data.contactPersonFunction || null,
});

const toCreateDto = (offer: JobOfferDetailDTO): JobOfferCreateDTO => ({
  jobTitle: offer.jobTitle,
  jobFunction: 'Project vacancy',
  publishOnBoard: offer.publishOnBoard,
  logoUrl: offer.logoUrl,
  otherFunction: offer.otherFunction,
  linkedProjectId: offer.linkedProjectId,
  location: offer.location,
  projectTitle: offer.projectTitle,
  projectSummary: offer.projectSummary,
  department: offer.department,
  type: offer.type,
  duration: offer.duration,
  contractDurationDays: offer.contractDurationDays,
  overDurationDays: offer.overDurationDays,
  sectors: offer.sectors,
  subSectors: offer.subSectors,
  regions: offer.regions,
  countries: offer.countries,
  cities: offer.cities,
  customCities: offer.customCities,
  homeBased: offer.homeBased,
  seniority: offer.seniority,
  restrictions: offer.restrictions,
  description: offer.description,
  descriptionPlainText: offer.descriptionPlainText,
  deadline: offer.deadline,
  deadlineTime: offer.deadlineTime,
  contactEmail: offer.contactEmail,
  contactPerson: offer.contactPerson,
  contactPersonFunction: offer.contactPersonFunction,
  applicationLink: offer.applicationLink,
  applicationMethod: offer.applicationMethod,
  estimatedStartDate: offer.estimatedStartDate,
});

export async function getAllJobOffers(): Promise<JobOfferListDTO[]> {
  try {
    const response = await apiClient.get<BackendJobOffer[]>('/job-offers');
    const merged = [...response, ...readStoredOffers().filter(stored => !response.some(item => String(item.id) === String(stored.id)))];
    return merged.map(normalizeOffer);
  } catch (error) {
    return readStoredOffers().map(normalizeOffer);
  }
}

export async function getJobOffersByType(type: JobOfferTypeEnum): Promise<JobOfferListDTO[]> {
  const offers = await getAllJobOffers();
  return offers.filter((job) => job.type === type);
}

export async function getJobOfferById(id: string): Promise<JobOfferDetailDTO | null> {
  try {
    const response = await apiClient.get<BackendJobOffer>(`/job-offers/${id}`);
    return normalizeOffer(response);
  } catch (error) {
    const stored = readStoredOffers().find((offer) => String(offer.id) === id);
    if (stored) return normalizeOffer(stored);
    console.error('Error fetching job offer by id:', error);
    return null;
  }
}

export async function getJobOffersByProject(projectId: string): Promise<JobOfferListDTO[]> {
  try {
    const response = await apiClient.get<BackendJobOffer[]>(`/job-offers/project/${encodeURIComponent(projectId)}`);
    const stored = readStoredOffers().filter((offer) => String(offer.linkedProjectId || offer.projectId || '') === projectId);
    const merged = [...response, ...stored.filter(item => !response.some(offer => String(offer.id) === String(item.id)))];
    return merged.map(normalizeOffer);
  } catch {
    return readStoredOffers()
      .filter((offer) => String(offer.linkedProjectId || offer.projectId || '') === projectId)
      .map(normalizeOffer);
  }
}

export async function getJobOffersByRecruiter(recruiterId: string): Promise<JobOfferListDTO[]> {
  const offers = await getAllJobOffers();
  const filtered = offers.filter((job) => job.recruiterId === recruiterId);
  return filtered.length > 0 ? filtered : offers;
}

export async function createJobOffer(data: JobOfferCreateDTO, recruiterId: string): Promise<JobOfferDetailDTO> {
  const payload = {
    ...buildPayload(data),
    organizationId: Number(recruiterId) || null,
  };

  try {
    const response = await apiClient.post<BackendJobOffer>('/job-offers', payload);
    const stored = readStoredOffers().filter((offer) => String(offer.id) !== String(response.id));
    writeStoredOffers([response, ...stored]);
    return normalizeOffer(response);
  } catch (error) {
    const now = new Date().toISOString();
    const fallback: BackendJobOffer = {
      id: `local-${Date.now()}`,
      ...payload,
      createdAt: now,
      updatedAt: now,
      organizationName: data.organisationName,
    };
    writeStoredOffers([fallback, ...readStoredOffers()]);
    return normalizeOffer(fallback);
  }
}

export async function updateJobOffer(id: string, data: Partial<JobOfferCreateDTO>): Promise<JobOfferDetailDTO | null> {
  const payload = buildPayload({
    jobTitle: data.jobTitle || '',
    jobFunction: data.jobFunction || '',
    logoUrl: data.logoUrl,
    otherFunction: data.otherFunction,
    publishOnBoard: data.publishOnBoard,
    linkedProjectId: data.linkedProjectId,
    location: data.location || '',
    projectTitle: data.projectTitle,
    projectSummary: data.projectSummary,
    department: data.department,
    type: data.type || JobOfferTypeEnum.PROJECT,
    duration: data.duration || '',
    contractDurationDays: data.contractDurationDays,
    overDurationDays: data.overDurationDays,
    sectors: data.sectors,
    subSectors: data.subSectors,
    regions: data.regions,
    countries: data.countries,
    cities: data.cities,
    customCities: data.customCities,
    homeBased: data.homeBased,
    seniority: data.seniority,
    restrictions: data.restrictions,
    description: data.description || '',
    descriptionPlainText: data.descriptionPlainText,
    deadline: data.deadline || new Date().toISOString().split('T')[0],
    deadlineTime: data.deadlineTime,
    applicationLink: data.applicationLink,
    applicationMethod: data.applicationMethod,
    estimatedStartDate: data.estimatedStartDate,
    requirements: data.requirements,
    responsibilities: data.responsibilities,
    qualifications: data.qualifications,
    benefits: data.benefits,
    salary: data.salary,
    contactEmail: data.contactEmail,
    contactPerson: data.contactPerson,
    contactPersonFunction: data.contactPersonFunction,
  });

  try {
    const response = await apiClient.put<BackendJobOffer>(`/job-offers/${id}`, payload);
    const stored = readStoredOffers().filter((offer) => String(offer.id) !== id);
    writeStoredOffers([response, ...stored]);
    return normalizeOffer(response);
  } catch {
    const stored = readStoredOffers();
    const index = stored.findIndex((offer) => String(offer.id) === id);
    if (index < 0) return null;
    stored[index] = { ...stored[index], ...payload, updatedAt: new Date().toISOString() };
    writeStoredOffers(stored);
    return normalizeOffer(stored[index]);
  }
}

export async function updateJobOfferStatus(id: string, status: JobOfferStatusEnum): Promise<JobOfferDetailDTO | null> {
  const existing = await getJobOfferById(id);
  if (!existing) {
    return null;
  }

  const response = await apiClient.put<BackendJobOffer>(`/job-offers/${id}`, {
    ...buildPayload(toCreateDto(existing)),
    status,
  });

  return normalizeOffer(response);
}

export async function deleteJobOffer(id: string): Promise<boolean> {
  await apiClient.delete(`/job-offers/${id}`);
  return true;
}

export async function getRecruiterStats(recruiterId: string): Promise<{
  totalOffers: number;
  activeOffers: number;
  totalApplications: number;
  closingSoon: number;
}> {
  const recruiterJobs = await getJobOffersByRecruiter(recruiterId);
  return {
    totalOffers: recruiterJobs.length,
    activeOffers: recruiterJobs.filter((job) => job.status === JobOfferStatusEnum.PUBLISHED).length,
    totalApplications: recruiterJobs.reduce((sum, job) => sum + (job.totalApplications || 0), 0),
    closingSoon: recruiterJobs.filter(
      (job) => job.daysRemaining <= 7 && job.status === JobOfferStatusEnum.PUBLISHED,
    ).length,
  };
}
