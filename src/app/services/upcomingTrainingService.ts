import {
    API_BASE_URL,
    getAuthHeaders,
    resolveCurrentOrganizationId,
} from './authService';

export interface UpcomingTrainingSector {
    id: number;
    code: string;
    name: string;
}

export interface UpcomingTrainingSubsector {
    id: number;
    sectorId: number;
    code: string;
    name: string;
}

export interface UpcomingTraining {
    id: number;
    title: string;
    description: string | null;
    level: string | null;
    deliveryMode: string | null;
    durationHours: number | null;
    courseLanguage: string | null;
    price: number | null;
    currency: string | null;
    isFree: boolean;
    modulesCount: number | null;
    startDate: string | null;
    status: string | null;
    thumbnailUrl: string | null;
    createdAt: string | null;
    tags: string | null;
    expertId: number | null;
    expertName: string | null;
    certificationAvailable: boolean;
    certificationPrice: number | null;
    certificationTitle: string | null;
    certificationIssuer: string | null;
    certificationValidityMonths: number | null;
    sectors: UpcomingTrainingSector[];
    subsectors: UpcomingTrainingSubsector[];
}

export const getUpcomingTrainings = async (): Promise<UpcomingTraining[]> => {
    const organizationId = await resolveCurrentOrganizationId();

    const response = await fetch(
        `${API_BASE_URL}/training/upcoming?organizationId=${encodeURIComponent(
            String(organizationId)
        )}`,
        {
            method: 'GET',
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        throw new Error(
            errorText ||
            `Unable to load upcoming trainings. HTTP status: ${response.status}`
        );
    }

    return response.json();
};