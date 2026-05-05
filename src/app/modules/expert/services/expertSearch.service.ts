const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ExpertSearchFilters {
  firstName?: string;
  familyName?: string;
  expertId?: string;
  keywords?: string;
  allWords?: boolean;
  searchOnlineCvs?: boolean;
  sectors: string[];
  subSectors: string[];
  countries: string[];
  regions: string[];
  fundingAgencies: string[];
  databases: string[];
  timeframeExperience?: string;
  minProjects?: string;
  currentlyWorkingIn?: string;
  nationality: string[];
  education: string[];
  languages: string[];
  languageLevel?: string;
  seniority?: string;
  cvLanguage?: string;
}

export interface ExpertSearchResult {
  id: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  title?: string;
  currentPosition?: string;
  yearsExperience?: number;
  country?: { name?: string };
  city?: { name?: string };
  primaryOrganizationName?: string;
  availabilityStatus?: string;
  ratingAvg?: number;
  completedProjects?: number;
  completedMissions?: number;
  verified?: boolean;
  level?: string;
  profileSummary?: string;
  sectors?: { sectorName?: string; sectorCode?: string }[];
  skills?: { skillName?: string; level?: string }[];
  languages?: { languageName?: string; proficiency?: string }[];
  educations?: { fieldOfStudy?: string; degree?: string; institution?: string }[];
}

export interface ExpertPreviewDTO {
  id: number;
  maskedName: string;
  title?: string;
  currentPosition?: string;
  yearsExperience?: number;
  country?: string;
  city?: string;
  profileSummary?: string;
  sectors: string[];
  countries: string[];
  skills: string[];
  languages: string[];
  education: string[];
  keyProjects: string[];
  completedProjects?: number;
  seniority?: string;
}

export interface ExpertSearchResponse {
  data: ExpertSearchResult[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function appendValue(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '' || value === false) return;
  if (Array.isArray(value)) {
    value.filter(Boolean).forEach(item => params.append(key, String(item)));
    return;
  }
  params.append(key, String(value));
}

export async function searchExperts(filters: ExpertSearchFilters, page: number, size: number, sort: string) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => appendValue(params, key, value));
  params.set('page', String(page));
  params.set('size', String(size));
  params.set('sort', sort);

  const response = await fetch(`${BASE_URL}/experts/search?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Unable to search experts (${response.status})`);
  }

  return response.json() as Promise<ExpertSearchResponse>;
}

export function buildExpertPreviewFromSearchResult(expert: ExpertSearchResult): ExpertPreviewDTO {
  const sectors = expert.sectors?.map(item => item.sectorName || item.sectorCode).filter(Boolean) as string[] || [];
  const skills = expert.skills?.map(item => item.skillName).filter(Boolean) as string[] || [];
  const languages = expert.languages?.map(item => [item.languageName, item.proficiency].filter(Boolean).join(' - ')).filter(Boolean) as string[] || [];
  const education = expert.educations?.map(item => [item.degree, item.fieldOfStudy, item.institution].filter(Boolean).join(', ')).filter(Boolean) as string[] || [];
  const country = expert.country?.name || '';

  return {
    id: expert.id,
    maskedName: `Expert #${expert.id}`,
    title: expert.currentPosition || expert.title,
    currentPosition: expert.currentPosition,
    yearsExperience: expert.yearsExperience,
    country,
    city: expert.city?.name,
    profileSummary: expert.profileSummary,
    sectors,
    countries: country ? [country] : [],
    skills,
    languages,
    education,
    keyProjects: [
      expert.completedProjects || expert.completedMissions
        ? `${expert.completedProjects ?? expert.completedMissions} completed projects or missions`
        : '',
      expert.primaryOrganizationName ? `Recent work with ${expert.primaryOrganizationName}` : '',
    ].filter(Boolean),
    completedProjects: expert.completedProjects ?? expert.completedMissions,
    seniority: expert.level,
  };
}

export async function getExpertPreview(expertId: number, fallbackExpert?: ExpertSearchResult) {
  try {
    const response = await fetch(`${BASE_URL}/experts/${encodeURIComponent(String(expertId))}/preview`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      return response.json() as Promise<ExpertPreviewDTO>;
    }

    if (!fallbackExpert) {
      throw new Error(`Unable to load expert preview (${response.status})`);
    }
  } catch (error) {
    if (!fallbackExpert) {
      throw error;
    }
  }

  return buildExpertPreviewFromSearchResult(fallbackExpert);
}
