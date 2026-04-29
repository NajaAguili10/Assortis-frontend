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
    jobTitle: offer.title || '',
    location: offer.location || '',
    projectTitle: offer.projectTitle || undefined,
    department: offer.department || (type === JobOfferTypeEnum.INTERNAL ? offer.contractType || undefined : undefined),
    type,
    duration: offer.contractType || '',
    description: offer.description || '',
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
    totalApplications: offer.totalApplications ?? offer.applicationsCount ?? 0,
    createdAt: offer.createdAt || new Date().toISOString(),
    updatedAt: offer.updatedAt || offer.createdAt || new Date().toISOString(),
  };
};

const buildPayload = (data: JobOfferCreateDTO): JobOfferUpsertPayload => ({
  title: data.jobTitle,
  description: data.description,
  contractType: data.duration,
  deadline: data.deadline,
  status: JobOfferStatusEnum.PUBLISHED,
  type: data.type,
  projectTitle: data.type === JobOfferTypeEnum.PROJECT ? data.projectTitle || null : null,
  department: data.type === JobOfferTypeEnum.INTERNAL ? data.department || null : null,
  location: data.location || null,
  contactEmail: data.contactEmail || null,
  contactPerson: data.contactPerson || null,
});

const toCreateDto = (offer: JobOfferDetailDTO): JobOfferCreateDTO => ({
  jobTitle: offer.jobTitle,
  location: offer.location,
  projectTitle: offer.projectTitle,
  department: offer.department,
  type: offer.type,
  duration: offer.duration,
  description: offer.description,
  deadline: offer.deadline,
  contactEmail: offer.contactEmail,
  contactPerson: offer.contactPerson,
});

export async function getAllJobOffers(): Promise<JobOfferListDTO[]> {
  const response = await apiClient.get<BackendJobOffer[]>('/job-offers');
  return response.map(normalizeOffer);
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
    console.error('Error fetching job offer by id:', error);
    return null;
  }
}

export async function getJobOffersByRecruiter(recruiterId: string): Promise<JobOfferListDTO[]> {
  const offers = await getAllJobOffers();
  const filtered = offers.filter((job) => job.recruiterId === recruiterId);
  return filtered.length > 0 ? filtered : offers;
}

export async function createJobOffer(data: JobOfferCreateDTO, recruiterId: string): Promise<JobOfferDetailDTO> {
  const response = await apiClient.post<BackendJobOffer>('/job-offers', {
    ...buildPayload(data),
    organizationId: Number(recruiterId) || null,
  });
  return normalizeOffer(response);
}

export async function updateJobOffer(id: string, data: Partial<JobOfferCreateDTO>): Promise<JobOfferDetailDTO | null> {
  const payload = buildPayload({
    jobTitle: data.jobTitle || '',
    location: data.location || '',
    projectTitle: data.projectTitle,
    department: data.department,
    type: data.type || JobOfferTypeEnum.PROJECT,
    duration: data.duration || '',
    description: data.description || '',
    deadline: data.deadline || new Date().toISOString().split('T')[0],
    requirements: data.requirements,
    responsibilities: data.responsibilities,
    qualifications: data.qualifications,
    benefits: data.benefits,
    salary: data.salary,
    contactEmail: data.contactEmail,
    contactPerson: data.contactPerson,
  });

  const response = await apiClient.put<BackendJobOffer>(`/job-offers/${id}`, payload);
  return normalizeOffer(response);
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
