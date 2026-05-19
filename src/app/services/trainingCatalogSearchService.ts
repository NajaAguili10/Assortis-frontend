import { API_BASE_URL, getAuthHeaders } from './authService';
import type { UpcomingTraining } from './upcomingTrainingService';

export interface TrainingCatalogSearchRequest {
    contentType?: string;
    level?: string;
    deliveryMode?: string;
    certificationAvailable?: boolean;
    keyWord?: string;
}

interface SearchCatalogCoursesParams {
    body: TrainingCatalogSearchRequest;
    sectorIds: number[];
    subsectorIds: number[];
}

const normalizeBaseUrl = (baseUrl: string): string =>
    baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

const buildSearchUrl = (sectorIds: number[], subsectorIds: number[]): string => {
    const params = new URLSearchParams();

    if (sectorIds.length > 0) {
        params.set('sectorIds', sectorIds.join(','));
    }

    if (subsectorIds.length > 0) {
        params.set('subsectorIds', subsectorIds.join(','));
    }

    const queryString = params.toString();

    return `${normalizeBaseUrl(API_BASE_URL)}/training/catalog/search${
        queryString ? `?${queryString}` : ''
    }`;
};

export const searchCatalogCourses = async ({
                                               body,
                                               sectorIds,
                                               subsectorIds,
                                           }: SearchCatalogCoursesParams): Promise<UpcomingTraining[]> => {
    const response = await fetch(buildSearchUrl(sectorIds, subsectorIds), {
        method: 'POST',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
            errorText ||
            `Unable to search catalog courses. HTTP status: ${response.status}`
        );
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];};